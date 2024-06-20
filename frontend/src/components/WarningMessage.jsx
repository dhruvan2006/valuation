import { useEffect, useState } from "react";

const WarningMessage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hideWarningDate = localStorage.getItem('hideWarningDate');
    if (hideWarningDate) {
      const currentDate = new Date();
      const hideWarningDateParsed = new Date(hideWarningDate);
      const oneWeekInMillis = 7 * 24 * 60 * 60 * 1000;

      if (currentDate - hideWarningDateParsed >= oneWeekInMillis) {
        // if a week has passed remove the item from localStorage
        localStorage.removeItem('hideWarningDate');
        setIsVisible(true);
      }
    } else {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    const currentDate = new Date();
    localStorage.setItem('hideWarningDate', currentDate.toISOString());
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className='bg-yellow-500 text-black w-full rounded-lg p-4 mb-6 relative shadow-lg shadow-yellow-900/75 transition transform duration-300 ease-in-out'>
      <button
        onClick={handleClose}
        className='absolute top-2 right-3 text-lg p-1 font-bold'
      >
        ✕
      </button>
      <h2 className='font-bold text-lg mb-1'>Warning</h2>
      <p className='text-sm'>The formula used is <span className='font-semibold'>valid</span> for stock markets only for <span className='font-semibold'>low levels of leverage</span> (up to about 3)</p>
    </div>
  );
}

export default WarningMessage;