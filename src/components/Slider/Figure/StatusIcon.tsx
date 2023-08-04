import React, { useEffect, useState } from "react";

import { styled } from "src/styles/stitches.config";

interface StatusProps {
  status: number;
}

const IconLock = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <title>Restricted Item</title>
    <path d="M368 192h-16v-80a96 96 0 10-192 0v80h-16a64.07 64.07 0 00-64 64v176a64.07 64.07 0 0064 64h224a64.07 64.07 0 0064-64V256a64.07 64.07 0 00-64-64zm-48 0H192v-80a64 64 0 11128 0z" />
  </svg>
);

const IconUnknown = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <title>Unknown Status</title>
    <path
      d="M160 164s1.44-33 33.54-59.46C212.6 88.83 235.49 84.28 256 84c18.73-.23 35.47 2.94 45.48 7.82C318.59 100.2 352 120.6 352 164c0 45.67-29.18 66.37-62.35 89.18S248 298.36 248 324"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeMiterlimit="10"
      strokeWidth="40"
    />
    <circle cx="248" cy="399.99" r="32" />
  </svg>
);

const StatusIcon: React.FC<StatusProps> = ({ status }) => {
  const [icon, setIcon] = useState<React.ReactNode>(<></>);

  useEffect(() => {
    switch (status) {
      case 403:
        setIcon(IconLock);
        break;
      default:
        setIcon(IconUnknown);
        break;
    }
  }, [status]);

  return <StyledStatusIcon data-testid="status-icon">{icon}</StyledStatusIcon>;
};

const StyledStatusIcon = styled("div", {
  width: "2rem",
  height: "2rem",
  backgroundColor: "#fff",
  borderRadius: "50%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",
  zIndex: "1",
  bottom: "1rem",
  right: "1rem",
  margin: "-1rem 0 0 -1rem",
  boxShadow: "5px 5px 13px #0003",

  svg: {
    height: "1rem",
    width: "1rem",
    color: "$accent",
    fill: "$accent",
  },
});

export default StatusIcon;
