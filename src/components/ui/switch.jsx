const Switch = ({ checked, onCheckedChange }) => {
    return (
      <button
        className={`w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 ${
          checked ? "bg-green-500" : "bg-gray-500"
        }`}
        onClick={() => onCheckedChange(!checked)}
      >
        <div
          className={`bg-white w-5 h-5 rounded-full shadow-md transform ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        ></div>
      </button>
    );
  };
  
  export { Switch };
  