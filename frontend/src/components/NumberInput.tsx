import React from 'react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/solid';

type NumberInputProps = {
  label: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
}

const NumberInput: React.FC<NumberInputProps> = ({ label, value, onDecrement, onIncrement }) => {
  return (
    <div className='flex flex-col gap-y-2'>
      <label className='text-white ml-1 text-sm'>{label}</label>
      <div className='relative flex items-center'>
        <button
          type='button'
          className='bg-zinc-800 hover:bg-zinc-600 rounded-s-lg p-3 h-[2.6rem] border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 z-10'
          onClick={onDecrement}
        >
          <MinusIcon className='text-white h-4 w-4' />
        </button>
        <input value={value} readOnly className='bg-zinc-800 border border-zinc-700 h-[2.6rem] text-center text-white text-sm block w-full py-2.5 focus:outline-none' />
        <button
          type='button'
          className='bg-zinc-800 hover:bg-zinc-600 rounded-e-lg p-3 h-[2.6rem] border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 z-10'
          onClick={onIncrement}
        >
          <PlusIcon className='text-white h-4 w-4' />
        </button>
      </div>
    </div>
  );
}

export default NumberInput;