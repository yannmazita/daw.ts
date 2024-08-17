// directives/ClickOutside.ts
import { DirectiveBinding } from 'vue';

function handleClick(e: MouseEvent, el: HTMLElement, binding: DirectiveBinding) {
    // Check if the click was outside the el and his children
    if (!(el === e.target || el.contains(e.target as Node))) {
        // Call the provided method
        binding.value(e);
    }
}

export default {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
        document.addEventListener('click', (e) => handleClick(e, el, binding));
    },
    unmounted(el: HTMLElement, binding: DirectiveBinding) {
        document.removeEventListener('click', (e) => handleClick(e, el, binding));
    }
};
