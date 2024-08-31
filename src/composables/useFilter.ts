export function useFilter() {
    function filterProperties(object: object, excludedProperties: string[]) {
        const filtered = {};
        for (const property in object) {
            if (!excludedProperties.includes(property)) {
                filtered[property] = object[property];
            }
        }
        return filtered;
    }
    return {
        filterProperties,
    };
}
