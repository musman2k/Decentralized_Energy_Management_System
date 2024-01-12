export const timeLeft = (deadline) => {
    const difference = new Date(deadline * 60 * 60 * 1000).getTime() - Date.now();
    const remainingMints = difference / (1000 * 60);
  
    return remainingMints.toFixed(0);
  };
  
  export const calculateBarPercentage = (goal, raisedEnergy) => {
    const percentage = Math.round((raisedEnergy * 100) / goal);
  
    return percentage;
  };
  
  export const checkIfImage = (url, callback) => {
    const img = new Image();
    img.src = url;
  
    if (img.complete) callback(true);
  
    img.onload = () => callback(true);
    img.onerror = () => callback(false);
  };