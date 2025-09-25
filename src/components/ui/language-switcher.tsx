'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(
    languages.find(lang => lang.code === i18n.language) || languages[0]
  );

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    i18n.changeLanguage(language.code);
  };

  return (
    <div className="relative">
      <Listbox value={selectedLanguage} onChange={handleLanguageChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full min-w-[160px] cursor-pointer rounded-lg bg-white/10 backdrop-blur-sm py-3 pl-4 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm border border-white/20 hover:bg-white/20 transition-colors">
            <span className="flex items-center">
              <span className="text-2xl mr-3">{selectedLanguage.flag}</span>
              <span className="block truncate text-white font-medium">
                {selectedLanguage.name}
              </span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDownIcon
                className="h-5 w-5 text-gray-300"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-900 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50 border border-white/20">
              {languages.map((language) => (
                <Listbox.Option
                  key={language.code}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-3 pl-4 pr-4 ${
                      active ? 'bg-white/10 text-white' : 'text-gray-200'
                    }`
                  }
                  value={language}
                >
                  {({ selected }) => (
                    <span className="flex items-center">
                      <span className="text-2xl mr-3">{language.flag}</span>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium text-white' : 'font-normal'
                        }`}
                      >
                        {language.name}
                      </span>
                    </span>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}