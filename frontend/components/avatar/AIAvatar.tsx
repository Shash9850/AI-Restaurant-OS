"use client";

import { motion } from "framer-motion";

import Image from "next/image";

type Props = {
  isTalking: boolean;
  isListening: boolean;
  isThinking: boolean;
};

export default function AIAvatar({
  isTalking,
  isListening,
  isThinking,
}: Props){

  return (

    <motion.div
animate={{
  y: [0, -8, 0],
  rotate: [0, 1, -1, 0],
  scale: isTalking
    ? [1, 1.03, 1]
    : 1,
}}
      transition={{
  duration: 4,
  repeat: Infinity,
  ease: "easeInOut",
}}
      className="relative w-56 h-56"
    >

<motion.div
  animate={{
    scale: isTalking
      ? [1, 1.02, 1]
      : 1,
  }}
  transition={{
    duration: 0.8,
    repeat: isTalking
      ? Infinity
      : 0,
  }}
  className="relative w-full h-full"
>

  <Image
    src={
  isThinking
    ? "/avatar/thinking.png"
    : isListening
    ? "/avatar/listening.png"
    : isTalking
    ? "/avatar/speaking.png"
    : "/avatar/idle.png"
}
    alt="AI Waiter"
    fill
    className="object-contain drop-shadow-2xl"
  />

</motion.div>

      {/* SPEAKING GLOW */}

      {
        isTalking && (

          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
            className="absolute inset-0 rounded-full border-4 border-orange-400"
          />
        )
      }

{
  isListening && (

    <motion.div
      animate={{
        scale: [1, 1.15, 1],
        opacity: [0.4, 0.1, 0.4],
      }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
      }}
      className="absolute inset-0 rounded-full border-4 border-blue-400"
    />
  )
}
    </motion.div>
  );
}


