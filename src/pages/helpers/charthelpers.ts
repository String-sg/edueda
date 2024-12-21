export const roundToNearestPowerOfTen = (value: number): number => {
    const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
    return Math.ceil(value / magnitude) * magnitude;
  };
  
export const calculateStepSize = (value: number): number => {
    const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
    return magnitude;
  };
  