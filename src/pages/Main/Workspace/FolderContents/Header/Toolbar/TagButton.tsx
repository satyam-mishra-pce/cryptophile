import { Button, ButtonProps } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import useStateCallback from "@/hooks/useStateCallback";
import { Color, ColorMap } from "@/store/user/types";
import { ChevronsUpDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

type TagButtonProps = {
  handleChange?: (newValue: Color | undefined) => void;
  value: Color | undefined;
};

const TagButton = ({
  value,
  handleChange,
  ...props
}: TagButtonProps & ButtonProps) => {
  const [selectedColor, setSelectedColor] = useStateCallback<Color | undefined>(
    value ?? undefined
  );

  const handleClick = (value: Color | undefined) => {
    const handleOnChange = (value: Color | undefined) => {
      handleChange?.(value);
    };
    if (selectedColor === value) {
      setSelectedColor(undefined, handleOnChange);
    } else {
      setSelectedColor(value, handleOnChange);
    }
  };

  useEffect(() => {
    setSelectedColor(value);
  }, [value]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          {...props}
          size={"sm"}
          variant={"outline"}
          style={{
            color: selectedColor ? `rgba(${ColorMap[selectedColor]})` : "",
          }}
        >
          <i
            className={`text-base ${
              selectedColor ? "fa-solid" : "fa-regular"
            } fa-tag`}
          ></i>
          <ChevronsUpDown className={`h-5 ml-2 -mr-2 text-muted-foreground`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleClick(undefined)}>
          <div className="h-5 w-5 rounded-full inline-flex items-center justify-center mr-2">
            {selectedColor ? (
              <i className="fa-regular fa-circle-xmark text-muted-foreground"></i>
            ) : (
              <i className="fa-solid fa-check text-foreground"></i>
            )}
          </div>
          <span className="capitalize">None</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {Object.keys(ColorMap).map((color) => {
          return (
            <DropdownMenuItem
              onClick={() => handleClick(color as Color)}
              key={color}
            >
              <div
                className="h-5 w-5 rounded-full border-2 border-foreground/10 inline-flex items-center justify-center mr-2"
                style={{
                  background: `rgb(${ColorMap[color as Color]})`,
                }}
              >
                {selectedColor === color && (
                  <i className="fa-solid fa-check text-xs text-white"></i>
                )}
              </div>
              <span className="capitalize">{color.toLowerCase()}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TagButton;
