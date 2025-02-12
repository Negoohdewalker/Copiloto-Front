<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import IconCerrar from "@/components/icons/IconCerrar.vue";
import IconBuscar from "@/components/icons/IconBuscar.vue";
import axios from "axios";
import { alertToast } from "@/functions";
import IconEyeAbrir from "@/components/icons/IconEyeAbrir.vue";
import IconEyeCerrar from "@/components/icons/IconEyeCerrar.vue";

// Configuración de la tabla y paginación
const rowsPerPage = ref(5);
const selectedFilter = ref("");
const currentPage = ref(1);
const showModal = ref(false);
const showRejectModal = ref(false);

// Texto que se escribe automáticamente
const text = "Designación de Jurados Informe Final";
const textoTipiado = ref("");
let index = 0;
const typeWriter = () => {
  if (index < text.length) {
    textoTipiado.value += text.charAt(index);
    index++;
    setTimeout(typeWriter, 80);
  }
};
onMounted(() => {
  typeWriter();
});

// Filtrado de datos y paginación
const tableData = ref<Solicitude[]>([]);
const filteredTableData = computed(() => {
  let filteredData = tableData.value ?? [];
  if (selectedFilter.value) {
    filteredData = filteredData.filter(
      (data) => data.estado === selectedFilter.value
    );
  }
  const startIndex = (currentPage.value - 1) * rowsPerPage.value;
  return filteredData.slice(startIndex, startIndex + rowsPerPage.value);
});

const totalPages = computed(() => {
  const filteredData = selectedFilter.value
    ? tableData.value.filter((data) => data.estado === selectedFilter.value)
    : tableData.value ?? [];
  return Math.ceil(filteredData.length / rowsPerPage.value);
});

// Estado de carga y solicitudes
const load = ref(false);
interface Solicitude {
  nombre: string | null;
  titulo: string | null;
  estado: string;
  oficio_id: string;
}
const fetchSolicitudes = async () => {
  load.value = true;
  try {
    const response = await axios.get('/api/oficio/solicitud-jurados/informe');
    if (response.data && Array.isArray(response.data[0])) {
      tableData.value = response.data[0].map((item: any) => ({
        nombre: item.nombre || 'N/A',
        titulo: item.titulo || 'N/A',
        estado: item.estado || 'Desconocido',
        oficio_id: item.oficio_id || 'N/A'
      }));
    } else {
      console.error('La respuesta de la API no contiene datos válidos:', response);
    }
  } catch (error) {
    console.error('Error al cargar las solicitudes:', error);
  } finally {
    load.value = false;
  }
};

// Estado de carga y datos para jurados
const jurados = ref<{ asesor: string, asesor_id: string, revisiones: { rol: string, estudiante: string, tiempo_dias: number }[], oficio_id: string | null }[]>([]);
const selectedPresidente = ref('');
const selectedSecretario = ref('');
const selectedVocal = ref('');
const selectedRevisiones = ref<Revision[]>([]);
const loadJurados = ref(false);
const selectedOficioId = ref<string | null>(null);
const VIEW_OFINFORME = import.meta.env.VITE_URL_VIEW_OFINFORME;

// Validación de números
const nroOficio1 = ref<string>('');
const nroExped1 = ref<string>('');
const validateNroOficio = () => {
  nroOficio1.value = nroOficio1.value.replace(/[^0-9]/g, '').slice(0, 3);
};
const validateNroExped = () => {
  nroExped1.value = nroExped1.value.replace(/[^0-9-]/g, '').slice(0, 17);
};
const formIsValid = computed(() => nroOficio1.value.length === 3 && nroExped1.value.length === 17);

interface Revision {
  rol: string;
  estudiante: string;
  tiempo_dias: number;
}

interface Jurado {
  asesor: string;
  asesor_id: string;
  revisiones: Revision[];
  oficio_id: string;
}

// Función para obtener los jurados desde el backend usando el `oficio_id`
const fetchJurados = async (oficio_id: string) => {
  if (!oficio_id) {
    console.error('Oficio ID es requerido para obtener los jurados');
    return;
  }
  loadJurados.value = true;
  try {
    const response = await axios.get(`/api/juries/get-select/${oficio_id}`);
    console.log('jurados api informe', response);
    let data = response.data;
    if (Array.isArray(data) && data.length > 0) {
      jurados.value = data.map((item) => ({
        asesor: item.asesor,
        asesor_id: item.asesor_id,
        revisiones: item.revisiones || [],
        oficio_id: item.oficio_id || null
      }));
    } else {
      console.error('La respuesta de la API no contiene jurados válidos');
    }
  } catch (error) {
    console.error('Error al cargar los jurados:', error);
  } finally {
    loadJurados.value = false;
  }
};

// Asignación de jurados y apertura de modales
const asignarJurado = () => {
  if (!selectedPresidente.value || !selectedSecretario.value || !selectedVocal.value) {
    alertToast('Por favor, selecciona un docente para cada rol.', 'error');
    return;
  }
  if (new Set([selectedPresidente.value, selectedSecretario.value, selectedVocal.value]).size < 3) {
    alertToast('No puedes seleccionar al mismo docente en roles diferentes', 'error');
    return;
  }
  alertToast('Jurados asignados correctamente.', "Éxito", "success");
  openSendModal();
};
const handleJuradoSelect = (rol: string, value: string) => {
  const juradoSeleccionado = jurados.value.find(jurado => jurado.asesor_id === value);
  selectedRevisiones.value = juradoSeleccionado ? juradoSeleccionado.revisiones : [];
};

const confirming = ref(false);

const sendToBackend = async () => {
  if (!formIsValid.value || !selectedOficioId.value) {
    alertToast('Formulario inválido o falta de oficio.', 'error');
    return;
  }
  confirming.value = true;
  try {
    await axios.put(`/api/office/djt/${selectedOficioId.value}/status`, {
      estado: 'tramitado',
      numero_oficio: nroOficio1.value,
      expediente: nroExped1.value,
      presidente: selectedPresidente.value,
      secretario: selectedSecretario.value,
      vocal: selectedVocal.value
    });
    alertToast('Datos enviados correctamente', "Éxito", "success");
    await fetchSolicitudes();
    closeModal();
  } catch (error) {
    alertToast('Error al enviar los datos al backend', 'error');
    console.error('Error al enviar datos:', error);
  } finally {
    confirming.value = false;
  }
};

// Manejo de navegación y apertura de modales
function goToPreviousPage() {
  if (currentPage.value > 1) currentPage.value--;
}
function goToNextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}
function openSendModal() {
  showRejectModal.value = true;
}
const openModal = (oficio_id: string) => {
  selectedOficioId.value = oficio_id;
  fetchJurados(oficio_id);
  showModal.value = true;
};
function closeModal() {
  showModal.value = false;
  showRejectModal.value = false;
}

// Inicializar al montar el componente
onMounted(() => {
  fetchSolicitudes();
});
</script>

<template>
  <template v-if="load">
    <div class="flex h-screen border-s-2 bg-gray-100">
      <div class="flex-1 p-10">
        <div class="flex justify-center items-center content-center px-14 flex-col">
          <h3 class="bg-gray-200 h-9 w-1/2 rounded-lg duration-200 skeleton-loader"></h3>
        </div>
        <div class="mt-8">
          <div class="mt-6">
            <div class="flex flex-col mt-3 sm:flex-row">
              <div class="w-full flex justify-end items-center space-x-2">
                <h3 class="bg-gray-200 h-10 w-1/3 rounded-lg duration-200 skeleton-loader"></h3>
              </div>
            </div>
            <div class="px-4 py-4 -mx-4 overflow-x-auto sm:-mx-8 sm:px-8 mt-5">
              <h3 class="bg-gray-200 h-[500px] w-[100%] rounded-lg duration-200 skeleton-loader"></h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <template v-else>
    <div class="flex h-screen border-s-2 font-Roboto bg-gray-100">
      <div class="flex-1 p-10 overflow-auto">
        <h3 class="text-4xl font-semibold text-center text-azul">{{ textoTipiado }}</h3>

        <div class="mt-8">
          <div class="flex flex-col mt-3 sm:flex-row font-Roboto">
            <div class="w-full flex justify-end items-center space-x-2">
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-2">
                  <IconBuscar />
                </span>
                <input placeholder="Buscar"
                  class="block w-full py-2 pl-8 pr-6 text-sm text-gray-700 placeholder-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:gray-700 focus:ring-2 focus:ring-base hover:shadow-lg transition ease-in-out duration-300" />
              </div>
              <div class="relative">
                <select v-model="rowsPerPage"
                  class="block w-full h-full px-4 py-2 pr-8 leading-tight text-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:border-base hover:shadow-lg focus:ring-2 focus:ring-base transition ease-in-out duration-300">
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
              </div>
              <div class="relative">
                <select v-model="selectedFilter"
                  class="block w-full h-full px-4 py-2 pr-8 leading-tight text-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:border-base hover:shadow-lg focus:ring-2 focus:ring-base transition ease-in-out duration-300">
                  <option value="">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="observado">Observado</option>
                  <option value="tramitado">Tramitado</option>
                </select>
              </div>
            </div>
          </div>
          <!-- Tabla de solicitudes -->
          <div class="px-4 py-4 -mx-4 overflow-x-auto sm:-mx-8 sm:px-8 mt-6">
            <div class="inline-block min-w-full overflow-hidden rounded-lg shadow bg-white">
              <table class="min-w-full leading-normal">
                <thead class="custom-thead font-Quicksand">
                  <tr class="text-center text-azul border-b-2 bg-gray-300">
                    <th class="py-2 px-3 tracking-wider text-left">ESTUDIANTE</th>
                    <th class="py-2 px-3 tracking-wider text-left">TÍTULO</th>
                    <th class="py-2 px-3 tracking-wider">ACCIÓN</th>
                    <th class="py-2 px-3 tracking-wider">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(u, index) in filteredTableData" :key="index"
                    class="border-b border-gray-200 hover:bg-gray-200 transition-colors duration-300">
                    <!-- Nombre del Estudiante -->
                    <td class="px-3 py-5 text-base">
                      <p class="text-black text-wrap w-72 uppercase">{{ u.nombre }}</p>
                    </td>

                    <!-- Título del Proyecto -->
                    <td class="px-3 py-5 text-base">
                      <p class="text-black text-wrap w-80 uppercase">{{ u.titulo }}</p>
                    </td>

                    <!-- Botón Asignar en una celda separada -->
                    <td class="px-3 py-5 text-center">
                      <div class="flex justify-center items-center">
                        <!-- Si el estado es "tramitado", mostrar enlace para ver el oficio -->
                        <a v-if="u.estado.toLowerCase() === 'tramitado'" :href="`${VIEW_OFINFORME}/${u.oficio_id}`"
                          target="_blank" class="flex items-center m-2 relative group">
                          <IconEyeCerrar class="mr-1 group-hover:hidden" />
                          <IconEyeAbrir class="mr-1 hidden group-hover:block" />
                          <span class="text-[#34495e]">Oficio <br> Múltiple</span>
                        </a>

                        <!-- Si el estado no es "tramitado", mostrar el botón de Asignar -->
                        <button v-else
                          class="w-24 px-5 py-1 mb-2 text-sm text-white bg-base rounded-xl focus:outline-none hover:bg-baseClarito"
                          @click="openModal(u.oficio_id)">
                          Asignar
                        </button>
                      </div>
                    </td>


                    <!-- Estado del Proyecto -->
                    <td class="px-3 py-5 text-center">
                      <span :class="`estado-estilo estado-${u.estado.toLowerCase().replace(' ', '-')}`">{{ u.estado
                        }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Paginación -->
              <div class="flex flex-col items-center px-5 py-5 border-t xs:flex-row xs:justify-between">
                <span class="text-sm text-gray-500 xs:text-sm italic">Mostrando del {{ (currentPage - 1) * rowsPerPage +
                  1 }} al {{ Math.min(currentPage * rowsPerPage, tableData.length) }} de {{ tableData.length }}</span>
                <div class="inline-flex mt-2 xs:mt-0 space-x-4">
                  <button :disabled="currentPage === 1" @click="goToPreviousPage"
                    class="px-4 py-2 text-white  bg-base hover:bg-baseClarito rounded-s-2xl">Anterior</button>
                  <button :disabled="currentPage === totalPages" @click="goToNextPage"
                    class="px-4 py-2 text-white   bg-base hover:bg-baseClarito rounded-e-2xl">Siguiente</button>
                </div>
              </div>

            </div>
          </div>

        </div>

        <!-- Modal para la designación de jurados -->
        <div v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50">
          <div class="relative max-w-lg w-full flex flex-col p-8 bg-white rounded-lg shadow-lg">
            <div class="flex justify-end items-start">
              <button
                class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out"
                @click="closeModal">
                <IconCerrar />
              </button>
            </div>
            <div class="w-full pr-4">
              <div class="flex items-start justify-between p-3">
                <h5 class="text-2xl font-ligth text-gray-900 text-center flex-1">Designación de jurados</h5>
              </div>
              <div class="p-6">
                <div class="flex-1">
                  <!-- Selección del presidente -->
                  <select v-model="selectedPresidente" id="presidente"
                    class="w-full p-2 border border-gray-300 rounded mb-4"
                    @change="handleJuradoSelect('Presidente', selectedPresidente)">
                    <option disabled value="">Selecciona un presidente</option>
                    <option v-for="jurado in jurados" :key="jurado.asesor_id" :value="jurado.asesor_id">
                      {{ jurado.asesor }}
                    </option>
                  </select>

                  <!-- Selección del secretario -->
                  <select v-model="selectedSecretario" id="secretario"
                    class="w-full p-2 border border-gray-300 rounded mb-4"
                    @change="handleJuradoSelect('Secretario', selectedSecretario)">
                    <option disabled value="">Selecciona un secretario</option>
                    <option v-for="jurado in jurados" :key="jurado.asesor_id" :value="jurado.asesor_id">
                      {{ jurado.asesor }}
                    </option>
                  </select>

                  <!-- Selección del vocal -->
                  <select v-model="selectedVocal" id="vocal" class="w-full p-2 border border-gray-300 rounded"
                    @change="handleJuradoSelect('Vocal', selectedVocal)">
                    <option disabled value="">Selecciona un vocal</option>
                    <option v-for="jurado in jurados" :key="jurado.asesor_id" :value="jurado.asesor_id">
                      {{ jurado.asesor }}
                    </option>
                  </select>
                </div>
              </div>
              <!-- Botón para asignar -->
              <div class="mt-6 flex justify-center">
                <button @click="asignarJurado"
                  class="px-4 py-2 text-base justify-center text-white bg-[#5d6d7e] rounded-lg w-60">Asignar</button>
              </div>
              <br>

              <!-- Tabla para mostrar las revisiones si existen -->
              <div v-if="selectedRevisiones.length" class="mt-6">
                <h3 class="text-xl font-semibold">Revisiones del jurado seleccionado</h3>
                <!-- Aplicamos un contenedor con scroll si la tabla crece mucho -->
                <div class="overflow-y-auto max-h-48"> <!-- Aquí se agrega el scroll -->
                  <table class="min-w-full table-auto mt-4 bg-white shadow-lg rounded-lg">
                    <thead>
                      <tr class="bg-gray-200 text-left">
                        <th class="px-4 py-2">Rol</th>
                        <th class="px-4 py-2">Estudiante</th>
                        <th class="px-4 py-2">Días</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(revision, index) in selectedRevisiones" :key="index">
                        <td class="border px-4 py-2">{{ revision.rol }}</td>
                        <td class="border px-4 py-2">{{ revision.estudiante }}</td>
                        <td class="border px-4 py-2">{{ revision.tiempo_dias }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div> <!-- Fin del contenedor con scroll -->
              </div>

              <!-- Mensaje cuando no hay revisiones -->
              <div v-else class="mt-6 text-gray-500 text-center">
                <p>No hay revisiones disponibles para el jurado seleccionado.</p>
              </div>

            </div>
          </div>
        </div>

        <!-- Modal para el envío de oficio -->
        <div v-if="showRejectModal"
          class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out">
          <div class="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
            <div class="flex justify-end items-start">
              <button
                class="absolute top-0 right-0 m-2 text-gray-900 hover:scale-75 transition-transform duration-150 ease-in-out"
                @click="closeModal">
                <IconCerrar />
              </button>
            </div>
            <div class="flex items-start justify-between p-3 border-b border-gray-200">
              <h5 class="text-2xl font-ligth text-gray-900 text-center flex-1">Se autogenerará el oficio para este
                estudiante</h5>
            </div>
            <div class="p-6">
              <p class="text-gray-500 text-lg text-left mb-2">Por favor dígite el N° de oficio.</p>
              <input type="text" id="nroOficio1" v-model="nroOficio1"
                class="mb-1 px-2 w-full rounded-md focus:border-gray-900 focus:ring-0" maxlength="3"
                @input="validateNroOficio" required />
              <p v-if="nroOficio1.length !== 3 && nroOficio1 !== ''" class="text-red-800 mb-3">Debe ingresar 3 dígitos
              </p>

              <p class="text-gray-500 text-lg text-left mb-2">Por favor dígite el N° de expediente.</p>
              <input type="text" id="nroExped1" v-model="nroExped1"
                class="mb-1 px-2 w-full rounded-md focus:border-gray-900 focus:ring-0" maxlength="17"
                @input="validateNroExped" required />
              <p v-if="nroExped1.length !== 17 && nroExped1 !== ''" class="text-red-800">Debe ingresar 17 dígitos</p>
            </div>
            <div class="flex items-center justify-center p-3 border-gray-200">
              <button
                :disabled="confirming" 
                class="px-3 py-2 text-xm font-Thin 100 text-white bg-[#5d6d7e] rounded-2xl" 
                @click="closeModal">
                Cancelar
              </button>

              <button 
                class="ml-4 px-3 py-2 text-xm font-Thin 100 text-white bg-base rounded-2xl"
                :disabled="!formIsValid || confirming" 
                @click="sendToBackend">
                <div v-if="confirming" class="flex items-center gap-2">
                  <svg class="animate-spin h-5 w-5 text-gray-200 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Enviando...
                </div>
                <p v-else>Enviar</p>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </template>

</template>

<style scoped>
.estado-estilo {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 400;
  border-radius: 0.375rem;
}

.estado-asignado {
  background-color: #48bb78;
  color: #ffffff;
}

.estado-solicitud {
  background-color: #5dade2;
  color: #ffffff;
}

.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}

.estado-tramitado {
  background-color: #39B49E;
  color: #ffffff;
}

.custom-thead th {
  font-weight: 700;
  font-size: 16px;
  text-transform: uppercase;
}
</style>
