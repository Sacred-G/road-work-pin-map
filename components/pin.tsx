import * as React from "react";
import Image from 'next/image';
import roadWorkIcon from '../images/road_work_icon.png'; // Adjust the path as needed

function Pin({ size }: { size: number }) {
  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <Image
        src={roadWorkIcon}
        alt="Road Work Icon"
        layout="fill"
        objectFit="contain"
      />
    </div>
  );
}

export default React.memo(Pin);
