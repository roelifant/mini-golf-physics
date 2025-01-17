export class VectorUtils {

    /**
     * Convert degrees to radians
     * 
     * @param degrees 
     * @returns radians
     */
    public degreesToRadians(degrees: number): number {
        return degrees * (Math.PI/180);
    }

    /**
     * Convert radians to degrees
     * 
     * @param radians 
     * @returns degrees
     */
    public radiansToDegrees(radians: number): number {
        return radians * (180/Math.PI);
    }

    /**
     * Round the value so it has a maximul of N decimals
     * 
     * @param value 
     * @param N 
     * @returns rounded value
     */
    public roundToNDecimals(value: number, N: number): number {
        const factor = (N*10);
        return Math.round(value * factor)/factor;
    }
}