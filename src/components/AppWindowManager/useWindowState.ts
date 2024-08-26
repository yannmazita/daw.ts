import { ref } from 'vue';
import { WindowProps } from './types';

export function useWindowState(props: WindowProps) {
    const topData = ref(props.top);
    const leftData = ref(props.left);
    const widthData = ref(props.width);
    const heightData = ref(props.height);
    const minWidthData = ref(props.minWidth);
    const minHeightData = ref(props.minHeight);
    const isResizingData = ref(props.isResizing);
    const isActiveData = ref(props.isActive);
    const isMaximizedData = ref(props.isMaximized);
    const maxWidthData = ref(props.maxWidth);
    const maxHeightData = ref(props.maxHeight);
    const titleData = ref(props.title);
    const windowInnerWidthData = ref(props.windowInnerWidth);
    const windowIdData = ref(props.windowId);
    const titleIconData = ref(props.titleIcon);
    const isButtonMaximizedData = ref(props.isButtonMaximized);
    const isButtonMinimizedData = ref(props.isButtonMinimized);
    const buttonsCol = ref(1);
    const buttonAreaWidth = ref(0);

    return {
        topData,
        leftData,
        widthData,
        heightData,
        minWidthData,
        minHeightData,
        isResizingData,
        isActiveData,
        isMaximizedData,
        maxWidthData,
        maxHeightData,
        titleData,
        windowInnerWidthData,
        windowIdData,
        titleIconData,
        isButtonMaximizedData,
        isButtonMinimizedData,
        buttonsCol,
        buttonAreaWidth,
    };
}
