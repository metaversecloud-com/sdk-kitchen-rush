import smallImg from "@/assets/ingredients/small.png";
import mediumImg from "@/assets/ingredients/medium.png";
import largeImg from "@/assets/ingredients/large.png";
import hotImg from "@/assets/ingredients/hot.png";
import icedImg from "@/assets/ingredients/iced.png";
import almondImg from "@/assets/ingredients/almond.png";
import oatImg from "@/assets/ingredients/oat.png";
import wholeImg from "@/assets/ingredients/whole.png";
import noMilkImg from "@/assets/ingredients/no-milk.png";
import vanillaImg from "@/assets/ingredients/vanilla.png";
import caramelImg from "@/assets/ingredients/caramel.png";
import mochaImg from "@/assets/ingredients/mocha.png";
import noFlavorImg from "@/assets/ingredients/no-flavor.png";
import cinnamonImg from "@/assets/ingredients/cinnamon.png";
import sprinklesImg from "@/assets/ingredients/sprinkles.png";
import whippedImg from "@/assets/ingredients/whipped.png";

export const INGREDIENT_ICONS: Record<string, string> = {
  "small": smallImg,
  "medium": mediumImg,
  "large": largeImg,
  "hot": hotImg,
  "iced": icedImg,
  "almond": almondImg,
  "oat": oatImg,
  "whole": wholeImg,
  "vanilla": vanillaImg,
  "caramel": caramelImg,
  "mocha": mochaImg,
  "cinnamon": cinnamonImg,
  "sprinkles": sprinklesImg,
  "whipped": whippedImg,
  "whipped_cream": whippedImg,
  "none": noMilkImg,
  "no-milk": noMilkImg,
  "no-flavor": noFlavorImg,
};

export const getIngredientIcon = (value: string | undefined): string | null => {
  if (!value) return null;
  return INGREDIENT_ICONS[value.toLowerCase()] ?? null;
};

export const getRecipeIcon = (category: string, value: string | undefined): string | null => {
  if (!value) return null;
  const v = value.toLowerCase();
  if (v === "none") {
    if (category === "milk") return INGREDIENT_ICONS["no-milk"];
    if (category === "flavor") return INGREDIENT_ICONS["no-flavor"];
    return null;
  }
  return INGREDIENT_ICONS[v] ?? null;
};

export const getRecipeLabel = (category: string, value: string | undefined): string => {
  if (!value) return "";
  const v = value.toLowerCase();
  if (v === "none") {
    if (category === "milk") return "No milk";
    if (category === "flavor") return "No flavor";
    return "None";
  }
  if (v === "whipped_cream") return "Whipped";
  return v.replace("_", " ");
};
