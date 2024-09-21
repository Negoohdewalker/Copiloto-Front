import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import AppLogin from '@/components/auth/AppLogin.vue'
import AppRegister from '@/components/auth/AppRegister.vue'
import DesignacionAsesor from '@/views/Estudiante/DesignacionAsesor.vue'
import SolicitarAsesor from '@/views/Asesor/SolicitarAsesor.vue'
import ConformidadAsesor from '@/views/Estudiante/ConformidadAsesor.vue'
import SolicitarRevisión from '@/views/Asesor/SolicitarRevisión.vue'
import DesignacionJurado from '@/views/Estudiante/DesignacionJurado.vue'
import ConformidadJurado from '@/views/Estudiante/ConformidadJurado.vue'
import AprobacionProyecto from '@/views/Estudiante/AprobacionProyecto.vue'
import RevisionJurado from '@/views/Jurado/RevisionJurado.vue'
import RevisionJuradoPresidente from '@/views/Jurado/RevisionJuradoPresidente.vue'
import DesignarJurados from '@/views/Paisi/DesignarJurados.vue'
import AprobarProyecto from '@/views/Paisi/AprobarProyecto.vue'
import ResolucionProyecto from '@/views/facultad/ResolucionProyecto.vue'
import ConformidadInformeAsesor from '@/views/Estudiante/ConformidadInformeAsesor.vue'
import DesignacionJuradoInforme from '@/views/Estudiante/DesignacionJuradoInforme.vue'
import ConformidadInformeJurados from '@/views/Estudiante/ConformidadInformeJurados.vue'
import AprobacionInforme from '@/views/Estudiante/AprobacionInforme.vue'
import ConformidadVRI from '@/views/Estudiante/ConformidadVRI.vue'
import DesignarAsesor from '@/views/Paisi/DesignarAsesor.vue'
import ResolucionAsesor from '@/views/facultad/ResolucionAsesor.vue'
import RevisionInforme from '@/views/Asesor/RevisionInforme.vue'
import RevisionJuradoInforme from '@/views/Jurado/RevisionJuradoInforme.vue'
import RevisionJuradoPresidenteInforme from '@/views/Jurado/RevisionJuradoPresidenteInforme.vue'
import AprobarInforme from '@/views/Paisi/AprobarInforme.vue'
import ResolucionInforme from '@/views/facultad/ResolucionInforme.vue'
import DesignacionJurados from '@/views/facultad/DesignacionJurados.vue'

import ProgresoProyecto from '@/views/Estudiante/ProgresoProyecto.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: AppLogin,
      meta: {
        title: 'Inicio de sesión',
      }
    },
    {
      path: '/estudiante',
      name: 'estudiante',
      meta: { roles: ['estudiante'], title: 'Estudiante' },
      component: AdminLayout,
      children: [
        { path: 'designacion-asesor', name: 'DesignacionAsesor', component: DesignacionAsesor, meta: { title: 'Designación asesor' } },
        { path: 'conformidad-asesor', name: 'ConformidadAsesor', component: ConformidadAsesor, meta: { title: 'Conformidad de asesor' } },
        { path: 'designacion-jurado', name: 'DesignacionJurado', component: DesignacionJurado, meta: { title: 'Designación de jurado' } },
        { path: 'conformidad-jurado', name: 'ConformidadJurado', component: ConformidadJurado, meta: { title: 'Conformidad de jurado' } },
        { path: 'aprobacion-proyecto', name: 'AprobacionProyecto', component: AprobacionProyecto, meta: { title: 'Aprobación de proyecto' } },
        { path: 'conformidad-informe-asesor', name: 'ConformidadInformeAsesor', component: ConformidadInformeAsesor, meta: { title: 'Conformidad de Informe Final por el Asesor' } },
        { path: 'designacion-informe-jurado', name: 'DesignacionJuradoInforme', component: DesignacionJuradoInforme, meta: { title: 'Designacion de Jurado para el Informe Final' } },
        { path: 'conformidad-informe-jurado', name: 'ConformidadJuradoInforme', component: ConformidadInformeJurados, meta: { title: 'Conformidad de Informe Final por los Jurados' } },
        { path: 'aprobacion-informe', name: 'AprobacionInforme', component: AprobacionInforme, meta: { title: 'Aprobacion de Informe por los Jurados' } },
        { path: 'conformidad-vri', name: 'ConformidadVRI', component: ConformidadVRI, meta: { title: 'Conformidad por Integridad VRI' } },
        { path: 'progreso', name: 'Progreso', component: ProgresoProyecto, meta: { title: 'progreso' } },
      ]
    },
    {
      path: '/asesor',
      name: 'asesor',
      meta: { roles: ['asesor'], title: 'Asesor' },
      component: AdminLayout,
      children: [
        { path: 'solicitar-asesor', name: 'SolicitarAsesor', component: SolicitarAsesor, meta: { title: 'Solicitar asesor' } },
        { path: 'solicitar-revision', name: 'SolicitarRevision', component: SolicitarRevisión, meta: { title: 'Solicitar revisión' } },
        { path: 'revision-informe', name: 'RevisionInforme', component: RevisionInforme, meta: { title: 'Revision informe' } },
      ]
    },
    {
      path: '/jurado',
      name: 'jurado',
      meta: { roles: ['jurado'], title: 'Jurado' },
      component: AdminLayout,
      children: [
        { path: 'revision-jurado', name: 'RevisionJurado', component: RevisionJurado, meta: { title: 'Revision jurado' } },
        { path: 'revision-presidente', name: 'RevisionPresidente', component: RevisionJuradoPresidente, meta: { title: 'Revisión presidente' } },
        { path: 'revisionJurado-informe', name: 'RevisiónJurado', component: RevisionJuradoInforme, meta: { title: 'Revisión jurado' } },
        { path: 'revisionJuradoPresidente-informe', name: 'RevisionPresidenteInforme', component: RevisionJuradoPresidenteInforme, meta: { title: 'Revisión presidente' } },

      ]
    },
    {
      path: '/paisi',
      component: AdminLayout,
      children: [
        { path: 'designar-jurado', name: 'DesignarJurados', component: DesignarJurados, meta: { title: 'Designar Jurados' } },
        { path: 'aprobar-proyecto', name: 'AprobarProyecto', component: AprobarProyecto, meta: { title: 'Aprobar proyecto' } },
        { path: 'designar-asesor', name: 'DesignarAsesor', component: DesignarAsesor, meta: {title: 'Designar asesor'}},
        
        { path: 'aprobar-informe', name: 'AprobarInforme', component: AprobarInforme, meta: { title: 'Aprobar informe' } },
      ]
    },
    {
      path: '/facultad',
      component: AdminLayout,
      children: [
        { path: 'resolucion-proyecto', name: 'ResolucionProyecto', component: ResolucionProyecto, meta: { title: 'Resolucion proyecto' } },
        { path: 'resolucion-asesor', name: 'ResoluciónAsesor', component: ResolucionAsesor, meta: { title: 'Resolución asesor' } },
        { path: 'designarJurado-informe', name: 'DesignarJurado', component: DesignacionJurados, meta: {title: 'Designar jurados'}},
        { path: 'resolucion-informe', name: 'ResolucionInforme', component: ResolucionInforme, meta: { title: 'Resolucion informe' } },

      ]
    },
    {
      path: '/register',
      name: 'register',
      component: AppRegister,
      meta: {
        title: 'Registrarme',
      },
    },
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const token = authStore.token;
  const role = authStore.role;
  const title = to.meta?.title as String;
  document.title = title as string;

  // Si no hay token y la ruta requiere autenticación, redirigir al login
  if (!token && to.name !== 'login' && to.name !== 'register') {
    return next({ name: 'login' });
  }

 // Si hay token, verificar el rol del usuario
  // if (token && !to.meta.roles.includes(role)) {
  //   // Si el usuario no tiene permiso para acceder a la ruta, redirigir a la ruta de su rol
  //   const roleRoutes: Record<string, string> = {
        // estudiante: "/estudiante",
        // asesor: "/asesor",
        // jurado: "/jurado",
        // paisi: "/paisi",
        // facultad: "/facultad",
        // admin: "/admin",
  //   };
  //   return next({ name: roleRoutes[role] });
  // }

  if ((to.name === 'login' || to.name === 'register') && token && role !== null) {
    const roleRoutes: Record<string, string> = {
      estudiante: "/estudiante",
      asesor: "/asesor",
      jurado: "/jurado",
      paisi: "/paisi",
      facultad: "/facultad",
      admin: "/admin",
    };
    return next({ name: roleRoutes[role] });
  }


  // Si todo está bien, continuar con la navegación
  next();
})

export default router
