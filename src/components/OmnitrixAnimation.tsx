import { useState } from "react";
import { motion } from "framer-motion";

interface OmnitrixAnimationProps {
  onComplete: () => void;
  isDark: boolean;
}

export default function OmnitrixAnimation({ onComplete, isDark }: OmnitrixAnimationProps) {
  const [, setIsHovered] = useState(false);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 perspective-[1000px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >

      {/* Central Omnitrix Animation with 3D Hover Effect */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0 }}
        animate={{
          scale: [0, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 3,
          ease: "easeInOut",
        }}
        onAnimationComplete={() => {
          setTimeout(onComplete, 1000);
        }}
      >
        <motion.div
          className="relative w-48 h-48 flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
          whileHover={{
            rotateX: 10,
            rotateY: -15,
            scale: 1.1,
          }}
          whileTap={{
            rotateX: -10,
            rotateY: 15,
            scale: 0.95,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          {/* Glowing Outer Circle */}
          <motion.div
            className="absolute w-48 h-48 rounded-full bg-black border-8 border-[#39ff14] shadow-[0_0_60px_#39ff14] z-10"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 360],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />

          {/* Center Omnitrix Symbol (Hourglass) */}
          <motion.div
            className="absolute w-32 h-32 z-20"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.9, 1, 0.9],
            }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          >
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              width="296"
              height="296"
              viewBox="0 0 296 296"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full"
              style={{
                fill: "#39ff14",
                stroke: "none",
                shapeRendering: "geometricPrecision",
                imageRendering: "crisp-edges",
              }}
            >
              <path d="M0 0 C97.68 0 195.36 0 296 0 C296 97.68 296 195.36 296 296 C198.32 296 100.64 296 0 296 C0 198.32 0 100.64 0 0 Z " fill="#69FD00" transform="translate(0,0)"/>
              <path d="M0 0 C44.22 0 88.44 0 134 0 C134 97.68 134 195.36 134 296 C89.78 296 45.56 296 0 296 C0 295.67 0 295.34 0 295 C0.58676514 294.91548584 1.17353027 294.83097168 1.77807617 294.74389648 C38.73760356 289.26508876 68.57387245 274.42612755 95 248 C94.646271 244.85814856 93.44501656 242.98843892 91.4453125 240.6015625 C90.6550769 239.64588379 90.6550769 239.64588379 89.84887695 238.67089844 C88.99555786 237.65817871 88.99555786 237.65817871 88.125 236.625 C86.93257097 235.1857426 85.7411822 233.74562276 84.55078125 232.3046875 C83.95217285 231.58249023 83.35356445 230.86029297 82.73681641 230.11621094 C80.20839822 227.03547874 77.75808167 223.89659531 75.3125 220.75 C71.16258149 215.42932362 66.87947032 210.23746467 62.5390625 205.0703125 C58.34415508 199.99770137 54.31348813 194.79776889 50.26220703 189.61035156 C47.20807018 185.71381642 44.100553 181.85960954 41 178 C35.91251384 171.66702968 30.86726982 165.30270291 25.85620117 158.90917969 C23.25527641 155.59159144 20.63952285 152.28706934 18 149 C19.44168458 144.56091471 21.88783081 141.49694053 24.9375 138.0625 C28.87221181 133.5251922 32.69095568 128.93078301 36.375 124.1875 C40.30828854 119.13071699 44.31502497 114.1430934 48.375 109.1875 C52.9089602 103.64734007 57.30577014 98.0214286 61.625 92.3125 C65.91437206 86.64668765 70.3286845 81.14257337 74.96386719 75.75683594 C78.8516125 71.22540532 82.54915848 66.5593719 86.20947266 61.84301758 C86.63276855 61.29798584 87.05606445 60.7529541 87.4921875 60.19140625 C87.90049805 59.66047363 88.30880859 59.12954102 88.72949219 58.58251953 C89.60567973 57.49115758 90.52105661 56.43051741 91.46582031 55.39794922 C94.20121732 52.56151093 94.20121732 52.56151093 95.03125 48.87109375 C82.39700428 25.94759488 46.29717011 11.96436681 23 5 C15.37915342 2.94100446 7.88042916 1.5158746 0 1 C0 0.67 0 0.34 0 0 Z " fill="#000000" transform="translate(162,0)"/>
              <path d="M0 0 C43.56 0 87.12 0 132 0 C132 0.33 132 0.66 132 1 C131.00484375 1.14695313 130.0096875 1.29390625 128.984375 1.4453125 C96.71595234 6.49557923 68.99707741 19.93612416 45 42 C44.41621582 42.51240234 43.83243164 43.02480469 43.23095703 43.55273438 C41.31605244 45.25426946 41.31605244 45.25426946 39 48 C39.28134422 51.26914628 40.69032415 53.16380125 42.7734375 55.6171875 C43.34521729 56.29918213 43.91699707 56.98117676 44.50610352 57.68383789 C45.43120728 58.76846313 45.43120728 58.76846313 46.375 59.875 C47.66405305 61.41167701 48.95179848 62.9494518 50.23828125 64.48828125 C51.19855225 65.63417725 51.19855225 65.63417725 52.17822266 66.80322266 C54.69974364 69.84378093 57.13920342 72.94346818 59.5625 76.0625 C63.48089053 81.0925728 67.46797651 86.06054968 71.5 91 C76.00767214 96.52333657 80.44842767 102.09184597 84.8359375 107.7109375 C88.87051332 112.8649332 93.00018927 117.93859713 97.13989258 123.00830078 C101.35063143 128.17473541 105.48551447 133.39666933 109.57421875 138.66015625 C111.30502212 140.88170569 113.0062969 143.0062969 115 145 C115.49204511 148.66751147 115.42513155 150.39363324 113.27734375 153.45703125 C112.50519531 154.23433594 111.73304687 155.01164063 110.9375 155.8125 C107.27375406 159.64225943 103.94210088 163.52714804 100.73046875 167.73828125 C98.9366787 170.0827608 97.10001821 172.3871731 95.25 174.6875 C92.05658878 178.66698168 88.89694137 182.6713025 85.75 186.6875 C81.36422334 192.28280356 76.93554586 197.84216407 72.48583984 203.38671875 C69.0845192 207.62984149 65.7222204 211.9016348 62.375 216.1875 C58.92291846 220.60250785 55.40854105 224.95122116 51.8125 229.25 C51.008125 230.21421875 50.20375 231.1784375 49.375 232.171875 C47.7830176 234.06759089 46.17865321 235.95297287 44.5625 237.828125 C43.82 238.70984375 43.0775 239.5915625 42.3125 240.5 C41.64863281 241.2734375 40.98476563 242.046875 40.30078125 242.84375 C38.81244788 244.86995472 38.81244788 244.86995472 39.0625 247.02734375 C47.60791643 265.00832415 77.39899085 279.09728255 95 286 C105.91858845 289.82577999 117.49721693 293.52354447 129.0625 294.625 C130.361875 294.74875 131.66125 294.8725 133 295 C133 295.33 133 295.66 133 296 C89.11 296 45.22 296 0 296 C0 198.32 0 100.64 0 0 Z " fill="#000000" transform="translate(0,0)"/>
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Pulsing Energy Ring */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 2.5, 4], opacity: [0.3, 0.1, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
      >
        <div className="w-32 h-32 rounded-full border-4 border-[#39ff14] opacity-30" />
      </motion.div>

      {/* Flash Effect */}
      <motion.div
        className="absolute inset-0 bg-[#39ff14]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.8, 0] }}
        transition={{ duration: 3, times: [0, 0.85, 0.9, 1] }}
      />

      {/* Transforming Text */}
      <motion.div
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <motion.p
          className={`text-xl font-bold tracking-widest ${isDark ? 'text-[#39ff14]' : 'text-green-600'}`}
          animate={{
            textShadow: [
              "0 0 10px #39ff14",
              "0 0 20px #39ff14",
              "0 0 10px #39ff14",
            ],
          }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        >
          TRANSFORMING...
        </motion.p>
      </motion.div>
    </motion.div>
  );
}