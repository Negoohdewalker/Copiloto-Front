import { ref, onMounted, onUnmounted } from "vue";

const isOpen = ref(false);

export function useSidebar() {
  const checkScreenSize = () => {
    if (window.innerWidth >= 1024) {
      isOpen.value = true;  
    } else {
      isOpen.value = false; 
    }
  };

  onMounted(() => {
    // Revisar el tamaño de la pantalla al cargar la página
    checkScreenSize(); 
    window.addEventListener("resize", checkScreenSize); 
  });

  onUnmounted(() => {
    window.removeEventListener("resize", checkScreenSize); 
  });

  return {
    isOpen,
  };
}
