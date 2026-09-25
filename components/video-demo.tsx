import React from "react";
import Image from "next/image";

export const VideoDemo = () => (
  <div className="px-6 relative">
    <Image
      width={1000}
      height={405}
      src={"/compressify-demo.gif"}
      className="h-full rounded-3xl w-full object-cover border-8 overflow-clip"
      alt="demo"
    />
  </div>
);
