export const generateRandomKey = () => {
  return Number(Math.random().toString().substring(2, 7) + Date.now()).toString(36);
};
