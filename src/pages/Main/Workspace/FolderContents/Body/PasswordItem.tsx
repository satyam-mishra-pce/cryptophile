import {
  ColorMap,
  type PasswordItem as PasswordItemType,
} from "@/store/user/types";
import React from "react";

type PasswordItemProps = {
  passwordItem: PasswordItemType;
  isSelected?: boolean;
  showSelectCheckbox?: boolean;
} & React.HTMLAttributes<HTMLButtonElement>;

const PasswordItem = ({
  passwordItem,
  isSelected,
  showSelectCheckbox,
  ...props
}: PasswordItemProps) => {
  return (
    <button
      className={`relative flex flex-col items-center rounded-lg p-3 gap-2 border ${
        isSelected
          ? "bg-secondary hover:bg-secondary border-border"
          : "hover:bg-secondary/80 border-transparent"
      } w-32 active:scale-95 transition ${props.className}`}
      onClick={(evt) => {
        props?.onClick?.(evt);
      }}
      {...props}
    >
      {passwordItem.isFavourite && (
        <i
          className="fa-solid fa-circle-star absolute top-2 right-4 text-primary text-sm"
          style={{
            color: passwordItem.tag ? `rgb(${ColorMap[passwordItem.tag]})` : "",
          }}
        ></i>
      )}
      {showSelectCheckbox &&
        (isSelected ? (
          <i className="fa-solid fa-check-square absolute top-2 left-2"></i>
        ) : (
          <i className="fa-regular fa-square absolute top-2 left-2"></i>
        ))}
      <i
        className="fa-solid fa-key text-6xl"
        style={{
          color: passwordItem.tag ? `rgb(${ColorMap[passwordItem.tag]})` : "",
        }}
      ></i>
      <span>{passwordItem.title}</span>
    </button>
  );
};

export default PasswordItem;
