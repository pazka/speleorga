//will determine if the value can be considered as empty independently of its type
export function isEmpty(value: any) {
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === "string") {
        return value.trim().length === 0;
    }
    if (typeof value === "object") {
        return Object.keys(value).length === 0;
    }
    if (typeof value === "number") {
        return value === 0;
    }
        
    return false;
}

export function arrayContainsEmptyString(array: string[]) {
    return array.some((value) => isEmpty(value));
}

export function getEmptyKeyFromObject(object: any) {
    return Object.keys(object).find((key) => isEmpty(object[key]));
}