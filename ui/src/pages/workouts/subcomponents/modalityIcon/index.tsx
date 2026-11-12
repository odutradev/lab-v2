import {
  TbBarbell,
  TbRun,
  TbWalk,
  TbBike,
  TbSwimming,
  TbMusic,
  TbBallFootball,
  TbKarate,
  TbFlame,
  TbYoga,
  TbActivity
} from "react-icons/tb";
import type { IconType } from "react-icons";

import { iconStyle } from "./styles";
import type { ModalityIconProps } from "./types";

const modalityIcons: Record<string, IconType> = {
  weightTraining: TbBarbell,
  running: TbRun,
  walking: TbWalk,
  cycling: TbBike,
  swimming: TbSwimming,
  dancing: TbMusic,
  football: TbBallFootball,
  martialArts: TbKarate,
  functional: TbFlame,
  yoga: TbYoga
};

export const ModalityIcon = ({ modalityId, size = 18 }: ModalityIconProps) => {
  const Icon = modalityIcons[modalityId] || TbActivity;
  return <Icon size={size} style={iconStyle} aria-hidden="true" />;
};

export default ModalityIcon;
