import { useState, useEffect } from "react";
import { controls } from "../../../constants/controls";
import { useKeyPress } from "../../../hooks/useKeyPress";
import { useArena } from "./useArena";

const getHitPower = (fighter) => {
  const criticalHitChance = Math.random() <= 0.5 ? 1 : 2;
  const hitPower = fighter.attack * criticalHitChance;
  return hitPower;
};

const getBlockPower = (fighter) => {
  const dodgeChance = Math.random() <= 0.5 ? 1 : 2;
  const blockPower = fighter.defense * dodgeChance;
  return blockPower;
};

const getDamage = (apw, dpw, type) => {
  if (type === "combo") {
    dpw = 0;
  }
  let hitPower = apw - dpw;
  hitPower < 0 ? (hitPower = 0) : (hitPower = hitPower);
  return hitPower;
};

const compareArr = (arr1, arr2) => {
  if (arr1.length === arr2.length) {
    return arr1.every((element, index) => {
      if (element === arr2[index]) {
        return true;
      }
      return false;
    });
  }
  return false;
};

let comboP1 = true;
let comboP2 = true;

export const useFight = () => {
  const { selectedPair } = useArena();

  let [fighters, setFighters] = useState({
    fighterOneDetails: {},
    fighterTwoDetails: {},
  });

  let { fighterOneDetails, fighterTwoDetails } = fighters;

  let [winner, setWinner] = useState();

  const { userCombos } = useKeyPress(controls);

  const {
    playerOneAttack,
    playerOneBlock,
    playerTwoAttack,
    playerTwoBlock,
    playerOneCriticalHitCombination,
    playerTwoCriticalHitCombination,
  } = controls;

  useEffect(() => {
    setFighters({
      fighterOneDetails: selectedPair.playerOne,
      fighterTwoDetails: selectedPair.playerTwo,
    });
  }, [selectedPair]);

  useEffect(() => {
    let attacker = {};
    let defender = {};

    let blocking = false; // player is blocking so he cant attack
    let block = false; // player has guard up

    const checkAttacker = () => {
      attacker === selectedPair.playerOne
        ? (defender = selectedPair.playerTwo)
        : (defender = selectedPair.playerOne);
    };

    let apw;
    let dpw;

    window.addEventListener("keyup", (e) => {
      try {
        if (e.code === playerOneAttack && !blocking) {
          attacker = selectedPair.playerOne;
          checkAttacker();
          apw = getHitPower(attacker);
          if (dpw === undefined) {
            dpw = selectedPair.playerTwo.defense;
          }
          defender.health -= getDamage(apw, dpw);
          block = false;
          if (block === false) {
            dpw = selectedPair.playerTwo.defense;
          }
        } else if (e.code === playerTwoAttack && !blocking) {
          attacker = selectedPair.playerTwo;
          checkAttacker();
          apw = getHitPower(attacker);
          if (dpw === undefined) {
            dpw = selectedPair.playerOne.defense;
          }
          defender.health -= getDamage(apw, dpw);
          block = false;
          if (block === false) {
            dpw = selectedPair.playerOne.defense;
          }
        }
        if (e.code === playerOneBlock) {
          defender = selectedPair.playerOne;
          dpw = getBlockPower(defender);
          block = true;
          blocking = true;
          window.addEventListener("keyup", () => {
            blocking = false;
          });
        } else if (e.code === playerTwoBlock) {
          defender = selectedPair.playerTwo;
          dpw = getBlockPower(defender);
          block = true;
          blocking = true;
          window.addEventListener("keyup", () => {
            blocking = false;
          });
        }

        if (
          compareArr(userCombos, playerOneCriticalHitCombination) &&
          comboP1
        ) {
          attacker = selectedPair.playerOne;
          checkAttacker();
          apw = getHitPower(attacker) * 2;
          if (dpw === undefined) {
            dpw = selectedPair.playerTwo.defense;
          }
          defender.health -= getDamage(apw, dpw, "combo");
          block = false;
          if (block === false) {
            dpw = selectedPair.playerTwo.defense;
          }
          if (getDamage(apw, dpw, "combo") > 0) {
            comboP1 = false;
            setTimeout(() => {
              comboP1 = true;
            }, 10000);
          }
        }
        if (
          compareArr(userCombos, playerTwoCriticalHitCombination) &&
          comboP2
        ) {
          attacker = selectedPair.playerTwo;
          checkAttacker();
          apw = getHitPower(attacker) * 2;
          if (dpw === undefined) {
            dpw = selectedPair.playerOne.defense;
          }
          defender.health -= getDamage(apw, dpw, "combo");
          block = false;
          if (block === false) {
            dpw = selectedPair.playerOne.defense;
          }
          if (getDamage(apw, dpw, "combo") > 0) {
            comboP2 = false;
            setTimeout(() => {
              comboP2 = true;
            }, 10000);
          }
        }
      } catch (err) {}

      setFighters({
        fighterOneDetails: selectedPair.playerOne,
        fighterTwoDetails: selectedPair.playerTwo,
      });

      for (let i in selectedPair) {
        if (selectedPair[i].health < 0) {
          for (let x in selectedPair) {
            if (selectedPair[x].health > 0) {
              setWinner(
                (winner =
                  selectedPair[
                    Object.keys(selectedPair)[
                      Object.keys(selectedPair).indexOf(x)
                    ]
                  ])
              );
            }
          }
        }
      }
    });
  }, [selectedPair]);

  // implement fight logic, return fighters details and winner details

  return {
    fighterOneDetails,
    fighterTwoDetails,
    winner,
  };
};
