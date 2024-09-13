// En tu archivo useSidebar.ts
import { ref } from "vue";

const isOpen = ref(true);

export const useSidebar = () => {
  const toggleSidebar = () => {
    isOpen.value = !isOpen.value;
  };

  return {
    isOpen,
    toggleSidebar, // Asegúrate de exportarlo
  };
};
