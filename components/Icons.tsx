import React from 'react';

const iconProps = {
  className: "w-5 h-5",
  viewBox: "0 0 20 20",
  fill: "currentColor"
};

export const UserPlusIcon: React.FC = () => (
  <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" >
    <path d="M11 5a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V5z" />
    <path fillRule="evenodd" d="M4.25 5.5a3 3 0 00-3 3v4a3 3 0 003 3h8a3 3 0 003-3v-4a3 3 0 00-3-3H4.25zM2.75 8.5a1.5 1.5 0 011.5-1.5h8a1.5 1.5 0 011.5 1.5v4a1.5 1.5 0 01-1.5 1.5h-8A1.5 1.5 0 012.75 12.5v-4z" clipRule="evenodd" />
  </svg>
);

export const DocumentArrowDownIcon: React.FC = () => (
  <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" >
    <path fillRule="evenodd" d="M5.5 10a.5.5 0 01.5.5v3.793l1.146-1.147a.5.5 0 01.708.708l-2 2a.5.5 0 01-.708 0l-2-2a.5.5 0 11.708-.708L5.5 14.293V10.5a.5.5 0 01.5-.5z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M5 2a1 1 0 011-1h4.586A1.5 1.5 0 0111.293 1.793L13.207 3.707a1.5 1.5 0 01.44.879V11a3 3 0 01-3 3H6a3 3 0 01-3-3V5a3 3 0 013-3zm5.793 1.293a.5.5 0 00-.353-.147H6a2 2 0 00-2 2v6a2 2 0 002 2h5a2 2 0 002-2V4.95a.5.5 0 00-.146-.353l-1.914-1.914z" clipRule="evenodd" />
  </svg>
);


export const TrashIcon: React.FC = () => (
  <svg {...iconProps} xmlns="http://www.w3.org/2000/svg" >
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75V4.5h8V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 2.5h-1a1.25 1.25 0 011.25 1.25V4.5h-1.5V3.75a1.25 1.25 0 00-1.25-1.25h-1A1.25 1.25 0 006.25 3.75V4.5h-1.5V3.75A2.75 2.75 0 017.5 1h5A2.75 2.75 0 0115.25 3.75V4.5h-1.5V3.75A1.25 1.25 0 0012.5 2.5h-1z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M3 5.5A.5.5 0 013.5 5h13a.5.5 0 010 1h-13a.5.5 0 01-.5-.5zM4.5 7.5a.5.5 0 000 1h11a.5.5 0 000-1h-11zM5 10.5a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5z" clipRule="evenodd" />
  </svg>
);


export const CheckIcon: React.FC = () => (
    <svg {...iconProps} xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
    </svg>
);

export const XMarkIcon: React.FC = () => (
    <svg {...iconProps} xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L10 8.94l3.47-3.47a.75.75 0 111.06 1.06L11.06 10l3.47 3.47a.75.75 0 11-1.06 1.06L10 11.06l-3.47 3.47a.75.75 0 01-1.06-1.06L8.94 10 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
);

export const ArrowUpTrayIcon: React.FC = () => (
  <svg {...iconProps} xmlns="http://www.w3.org/2000/svg">
    <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
    <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
  </svg>
);

export const ArrowDownTrayIcon: React.FC = () => (
  <svg {...iconProps} xmlns="http://www.w3.org/2000/svg">
     <path d="M10.75 4.75a.75.75 0 00-1.5 0v8.614L6.295 10.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V4.75z" />
     <path d="M3.5 14.75a.75.75 0 00-1.5 0v1.5A2.75 2.75 0 004.75 19h10.5A2.75 2.75 0 0018 16.25v-1.5a.75.75 0 00-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-1.5z" />
  </svg>
);