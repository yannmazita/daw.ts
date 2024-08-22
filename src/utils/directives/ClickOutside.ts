import { DirectiveBinding } from 'vue';

function handleClick(e: MouseEvent, el: HTMLElement, binding: DirectiveBinding) {
    // Check if the click was outside the element and its children
    if (!(el === e.target || el.contains(e.target as Node))) {
        // Call the provided method
        binding.value(e);
    }
}


export default {
    beforeMount(el: HTMLElement, binding: DirectiveBinding<any>) {
        // Attach an event listener to the document
        el.clickOutsideEvent = function(event: MouseEvent) {
            handleClick(event, el, binding);
        };
        document.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el: HTMLElement) {
        // Remove the event listener from the document
        document.removeEventListener('click', el.clickOutsideEvent);
    }
};
