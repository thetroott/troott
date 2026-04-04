// transform an array of n items to a  nested array, with each child array having four items 


export function TransformArray(inputArray: unknown[],rowSize?:number): unknown[][] {
    const result: unknown[][] = [];
    const size = rowSize || 4; // Default to 4 if no rowSize is provided
    for (let i = 0; i < inputArray.length; i += size) {
        result.push(inputArray.slice(i, i + size));
    }

    return result;
}