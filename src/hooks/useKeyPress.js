import { useEffect } from "react";

export const useKeyPress = (controls) => {
  let i = 0;
  let userCombos = [];

  window.addEventListener("keyup", (e) => {
    userCombos.splice(i <= 2 ? i++ : (i = 0), 1, e.code);
  });

  return {
    userCombos,
  };
};
