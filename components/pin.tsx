import * as React from "react";
interface PinProps {
  size: number;
  imageUrl: string;
  style?: React.CSSProperties;}
  
const pinStyle = {
  display: 'flex',
  width: '50px',  // Ensure the image scales correctly
  height: '50px', // Ensure the image scales correctly

};

function Pin({ size, imageUrl }: { size: number, imageUrl: string }) {
  return (
    <img src={imageUrl} alt="Pin" height={size} width={size} style={pinStyle} />
  );
}

export default React.memo(Pin);
