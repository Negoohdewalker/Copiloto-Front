<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import IconBuscar from "@/components/icons/IconBuscar.vue";
import IconCerrar from "@/components/icons/IconCerrar.vue";
import IconEyeAbrir from "@/components/icons/IconEyeAbrir.vue";
import IconEyeCerrar from "@/components/icons/IconEyeCerrar.vue";
import { alertToast } from "@/functions";

// Interfaces
interface Solicitude {
  id: string; // ID del estudiante
  nombre: string; // Nombre del estudiante
  filtroId: string; // ID del filtro
  filtroFecha: string; // Fecha del filtro
  filtroEstado: string; // Estado del filtro
  documentos: Document[]; // Lista de documentos asociados a la solicitud
}

interface Document {
  doc_nombre: string; // Nombre del documento según la API
  doc_link: string; // Enlace al documento según la API
}

// Variables Reactivas
const load = ref<boolean>(false); // Indicador de carga
const textoTipiado1 = ref(""); // Texto animado
const tableData = ref<Solicitude[]>([]); // Solicitudes cargadas
const documents = ref<Document[]>([]); // Documentos del modal
const isHovered = ref(false); // Efecto hover en botones
const selectedFilter = ref(""); // Filtro de estado
const rowsPerPage = ref(5); // Filas por página
const currentPage = ref(1); // Página actual
const showDocumentModal = ref(false); // Modal de documentos
const showApprovalModal = ref(false); // Modal de aprobación
const filtroId = ref(""); // ID del filtro seleccionado para aprobar
const loading = ref(false); // Indicador de carga
const selectedFile = ref<File | null>(null); // Archivo seleccionado


// Animación de texto
const text = "Buenas prácticas - Segundo filtro";
let index = 0;
const typeWriter = () => {
  if (index < text.length) {
    textoTipiado1.value += text.charAt(index);
    index++;
    setTimeout(typeWriter, 80);
  }
};

// Función para abrir el modal de documentos
function openDocumentModal(docs: Document[]) {
  documents.value = docs;
  showDocumentModal.value = true;
}

// Función para cerrar el modal de documentos
function closeDocumentModal() {
  documents.value = [];
  showDocumentModal.value = false;
}

// Función para abrir el modal de aprobación
function openApprovalModal(filterId: string) {
  filtroId.value = filterId;
  showApprovalModal.value = true;
}

// Función para cerrar el modal de aprobación
function closeApprovalModal() {
  showApprovalModal.value = false;
  filtroId.value = "";
  selectedFile.value = null;
}

// Función para obtener solicitudes desde la API
const fetchSolicitudes = async () => {
  try {
    const response = await axios.get("/api/vri/get-tercer-filtro");
    console.log("tres", response);
    tableData.value = response.data.map((item: any) => ({
      id: item.estudiante_id,
      nombre: item.nombre,
      filtroId: item.filtro_id,
      filtroFecha: item.filtro_fecha,
      filtroEstado: item.filtro_estado,
      documentos: item.documentos.map((doc: any) => ({
        doc_nombre: doc.doc_nombre,
        doc_link: doc.doc_link,
      })),
    }));
  } catch (error) {
    console.error("Error al cargar solicitudes:", error);
    alertToast("Error al cargar solicitudes", "Error", "error");
  }
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement | null;
  if (input?.files && input.files[0]) {
    selectedFile.value = input.files[0]; // Asignar el archivo.
  } else {
    selectedFile.value = null; // Limpiar el archivo si no es válido.
    alertToast("Debe seleccionar un archivo válido.", "Advertencia", "warning");
  }
};

const approveSolicitud = async (filterId: string) => {
  try {
    loading.value = true;

    const formData = new FormData();

    // Agregar el estado directamente como un campo
    formData.append("fil_estado", "aprobado");

    // Agregar el archivo si existe
    if (selectedFile.value) {
      formData.append("fil_path", selectedFile.value);
    }

    // Log para debugging
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    // Realizar la petición
    const response = await axios.post(
      `/api/vri/update-filter/${filterId}/status?_method=PUT`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      }
    );

    console.log("Respuesta:", response.data);

    if (response.data.estado === "aprobado") {
      alertToast("Solicitud aprobada correctamente.", "Éxito", "success");

      // Cerrar el modal
      closeApprovalModal();

      // Recargar las solicitudes para reflejar el cambio en el estado
      await fetchSolicitudes();
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error en Axios:", error.response?.data || error.message);
      alertToast(
        error.response?.data?.message || "Error desconocido.",
        "Error",
        "error"
      );
    } else {
      console.error("Error inesperado:", error);
      alertToast("Ocurrió un error inesperado.", "Error", "error");
    }
  } finally {
    loading.value = false;
  }
};



// Filtrado y paginación
const filteredTableData = computed(() => {
  let filtered = tableData.value;
  if (selectedFilter.value) {
    filtered = filtered.filter(
      (item) =>
        item.filtroEstado?.toLowerCase() === selectedFilter.value.toLowerCase()
    );
  }
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return filtered.slice(start, start + rowsPerPage.value);
});

const totalPages = computed(() =>
  Math.ceil(
    (selectedFilter.value
      ? tableData.value.filter(
          (item) =>
            item.filtroEstado?.toLowerCase() ===
            selectedFilter.value.toLowerCase()
        )
      : tableData.value
    ).length / rowsPerPage.value
  )
);

const goToPreviousPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

// Ejecutar al montar el componente
onMounted(() => {
  fetchSolicitudes();
  typeWriter();
});
</script>
<template>
  <template v-if="load">
    <div class="flex h-screen border-s-2 bg-gray-100">
      <div class="flex-1 p-10">
        <div class="flex justify-center items-center content-center px-14 flex-col">
          <h3 
            class="bg-gray-200 h-9 w-1/2 rounded-lg duration-200 skeleton-loader">
          </h3>
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
        <h3 class="text-4xl font-semibold text-center text-azul">{{ textoTipiado1 }}</h3>
        <div class="mt-8">
          <!-- Filtros de tabla -->
          <div class="mt-6">
            <div class="flex flex-col mt-3 sm:flex-row font-Roboto">
              <!-- Filtro de cantidad de entradas -->
              <div class="w-full flex justify-end items-center space-x-2">
                <!-- Búsqueda -->
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-2">
                    <IconBuscar />
                  </span>
                  <input
                    placeholder="Buscar"
                    class="block w-full py-2 pl-8 pr-6 text-sm text-gray-700 placeholder-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:gray-700 focus:ring-2 focus:ring-base hover:shadow-lg transition ease-in-out duration-300"
                   />
                </div>
                <div class="relative">
                  <select
                  v-model="rowsPerPage"
                  class="block w-full h-full px-4 py-2 pr-8 leading-tight text-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:border-base hover:shadow-lg focus:ring-2 focus:ring-base transition ease-in-out duration-300"
                >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </select>
                </div>

                <!-- Filtro de estado -->
                <div class="relative">
                  <select
                  v-model="selectedFilter"
                  class="block w-full h-full px-4 py-2 pr-8 leading-tight text-base bg-white border border-base rounded-lg appearance-none focus:outline-none focus:border-base hover:shadow-lg focus:ring-2 focus:ring-base transition ease-in-out duration-300"
                >
                    <option value="">Todos</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Observado">Observado</option>
                    <option value="Tramitado">Tramitado</option>
                  </select>
                </div>
              </div>
            </div>
            <br>

            <!-- Tabla -->
            <div class="px-4 py-4 -mx-4 overflow-x-auto sm:-mx-8 sm:px-8 mt-6 ">
              <div
                class="inline-block min-w-full overflow-hidden rounded-lg shadow bg-white"
              >
              <table class="min-w-full leading-normal">
              <thead class="custom-thead font-Quicksand">
                <tr class="text-center text-azul border-b-2 bg-gray-300">
                  <th class="py-2 px-3 text-left tracking-wider">ESTUDIANTE</th>
                  <th class="py-2 px-3 text-center tracking-wider">FECHA</th>
                  <th class="py-2 px-4 text-center tracking-wider">DOCUMENTOS</th>
                  <th class="py-2 px-3 text-center tracking-wider">ACCIÓN</th>
                  <th class="py-2 px-3 text-center tracking-wider">ESTADO</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="solicitude in tableData"
                  :key="solicitude.filtroId"
                  class="border-b border-gray-200 hover:bg-gray-200 transition-colors duration-300"
                >
                  <td class="px-3 py-5 text-base text-black">{{ solicitude.nombre }}</td>
                  <td class="px-3 py-5 text-base text-center text-black">{{ solicitude.filtroFecha }}</td>
                  <td class="px-3 py-5 text-center">
                    <a
                      :href="solicitude.documentos[0]?.doc_link"
                      target="_blank"
                      class="flex items-center justify-center text-azul hover:underline group"
                    >
                      <!-- Ícono dinámico (cerrado y abierto) -->
                      <IconEyeCerrar class="mr-1 w-5 h-5 group-hover:hidden" />
                      <IconEyeAbrir class="mr-1 w-5 h-5 hidden group-hover:block" />
                      <span class="text-[#34495e]">Ir al informe final</span>
                    </a>
                  </td>


                  <td class="px-3 py-5 flex flex-col items-center justify-center">
                    <button
                        :class="[ 
                          'w-24 px-4 py-1 text-sm text-white bg-base rounded-xl focus:outline-none', 
                          solicitude.filtroEstado === 'aprobado' 
                            ? 'cursor-not-allowed bg-gray-300' 
                            : 'hover:bg-green-600' 
                        ]"
                        :disabled="solicitude.filtroEstado === 'aprobado'"
                        @click="openApprovalModal(solicitude.filtroId)"
                      >
                        Aprobar
                      </button>
                      <!-- Botón de Aprobar (sin deshabilitar para pruebas) -->
                      <!-- <button
                        class="w-24 px-4 py-1 text-sm text-white bg-base rounded-xl focus:outline-none hover:bg-green-600"
                         @click="openApprovalModal(solicitude.filtroId)"
                      >
                        Aprobar
                      </button> -->
                  </td>
                  <td class="px-3 py-5 text-center">
                    <span
                      :class="`estado-estilo estado-${solicitude.filtroEstado?.toLowerCase().replace(' ', '-')}`"
                    >
                      {{ solicitude.filtroEstado
                        ? solicitude.filtroEstado.charAt(0).toUpperCase() +
                          solicitude.filtroEstado.slice(1).toLowerCase()
                        : "Estado desconocido" }}
                    </span>
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
        </div>

        
      <!-- Modal de Aprobación -->
      <div v-if="showApprovalModal" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-60">
          <div class="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <div class="flex justify-between items-center border-b pb-3">
              <h3 class="text-xl font-medium text-gray-600">Confirmar Aprobación</h3>
              <button @click="closeApprovalModal" class="text-gray-600 hover:text-gray-900">
                <IconCerrar />
              </button>
            </div>
            <div class="mt-4">
              <label for="fileInput" class="block text-sm font-medium text-gray-700">Subir archivo PDF:</label>
              <input
                id="fileInput"
                type="file"
                accept="application/pdf"
                class="mt-2 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
                @change="handleFileChange"
              />

            </div>
            <div class="flex justify-end mt-4">
              <button
                @click="closeApprovalModal"
                class="px-4 py-2 text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                @click="() => approveSolicitud(filtroId)"
                :disabled="loading"
                class="ml-4 px-4 py-2 text-white bg-base rounded-lg hover:bg-baseClarito"
              >
                {{ loading ? "Cargando..." : "Aprobar" }}
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

.estado-aceptado {
  background-color: #39B49E;
  color: #ffffff;
}

.estado-aprobado {
  background-color: #48bb78;
  color: #ffffff;
}
.estado-pendiente {
  background-color: #8898aa;
  color: #ffffff;
}


.custom-thead th {
  font-weight: 700; /* Grosor delgado */
  font-size: 16px;  /* Tamaño de la fuente */
  text-transform: uppercase; /* Todo el texto en mayúsculas */
}


</style>