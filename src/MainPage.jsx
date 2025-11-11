import { motion } from "framer-motion";

function MainPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white px-4">
      
      {/* Main Character */}
      <motion.div
        className="w-40 h-40 bg-gray-700 rounded-full mb-12 flex items-center justify-center text-4xl"
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        🤖
      </motion.div>

      {/* Game Title */}
      <motion.h1
        className="text-5xl font-bold mb-12"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Titanium Void
      </motion.h1>

      {/* Buttons */}
      <div className="flex flex-col space-y-4">
        <motion.button
          className="px-8 py-3 bg-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          New Game
        </motion.button>

        <motion.button
          className="px-8 py-3 bg-gray-700 rounded-lg text-lg font-semibold hover:bg-gray-600"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Resume Game
        </motion.button>

        <motion.button
          className="px-8 py-3 bg-green-600 rounded-lg text-lg font-semibold hover:bg-green-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Settings
        </motion.button>
      </div>
    </div>
  );
}

export default MainPage;
