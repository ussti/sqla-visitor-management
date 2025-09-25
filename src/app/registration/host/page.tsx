'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from '@/contexts/form-context';
import { hostSchema, HostInfo } from '@/lib/validation';
import { FormContainer } from '@/components/forms/form-container';
import { StaffMember } from '@/types/staff';
import { mondayService } from '@/services/monday';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';

export default function HostPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { state, updateMultipleFields, completeStep, setError, clearError } = useForm();
  const [staffMembers, setStaffMembers] = React.useState<StaffMember[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedHost, setSelectedHost] = React.useState<StaffMember | null>(null);
  const [showError, setShowError] = React.useState(false);

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useReactHookForm<HostInfo>({
    resolver: zodResolver(hostSchema),
    defaultValues: {
      hostId: state.hostId || '',
      hostName: state.hostName || '',
      hostEmail: state.hostEmail || '',
    },
    mode: 'onChange',
  });

  // Load staff directory on mount
  React.useEffect(() => {
    const loadStaffDirectory = async () => {
      try {
        const staff = await mondayService.getStaffDirectory();
        setStaffMembers(staff);

        // If host is already selected, find and set it
        if (state.hostId) {
          const host = staff.find(s => s.id === state.hostId);
          if (host) {
            setSelectedHost(host);
          }
        }
      } catch (error) {
        console.error('Error loading staff directory:', error);
        setError('staff', 'Failed to load staff directory');
      } finally {
        setIsLoadingStaff(false);
      }
    };

    loadStaffDirectory();
  }, [state.hostId, setError]);

  // Filter staff based on search query
  const filteredStaffList = React.useMemo(() => {
    if (!searchQuery) {
      return staffMembers;
    } else {
      return staffMembers.filter(staff =>
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  }, [searchQuery, staffMembers]);

  // Update form context when host selection changes
  React.useEffect(() => {
    if (selectedHost) {
      updateMultipleFields({
        hostId: selectedHost.id,
        hostName: selectedHost.name,
        hostEmail: selectedHost.email,
      });
      clearError('host');
      setShowError(false);
    }
  }, [selectedHost]);

  const onSubmit = async (data: HostInfo) => {
    try {
      if (!selectedHost) {
        setShowError(true);
        setError('host', t('host.errors.hostRequired'));
        return;
      }

      updateMultipleFields(data);
      completeStep(3);
      router.push('/registration/photo');
    } catch (error) {
      console.error('Error submitting host info:', error);
      setError('form', 'Failed to save host information');
    }
  };

  const isValid = selectedHost !== null;

  return (
    <FormContainer
      title={t('host.title')}
      onSubmit={handleSubmit(onSubmit)}
      previousHref="/registration/contact"
      isSubmitting={isSubmitting}
      canProceed={Boolean(isValid)}
    >
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          {t('host.selectHost')} <span className="text-red-400">*</span>
        </label>

        {isLoadingStaff ? (
          <div className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-400">
            {t('common.loading')}
          </div>
        ) : (
          <div className="relative">
            <Listbox value={selectedHost} onChange={setSelectedHost}>
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-gray-900 border border-gray-700 py-3 pl-4 pr-10 text-left shadow-md focus:outline-none focus-visible:border-white focus-visible:ring-2 focus-visible:ring-white hover:border-gray-600 transition-colors">
                  <span className="block truncate text-white">
                    {selectedHost ? (
                      <span>
                        <span className="font-medium">{selectedHost.name}</span>
                        <span className="text-gray-400 ml-2">- {selectedHost.jobTitle}</span>
                      </span>
                    ) : (
                      <span className="text-gray-400">{t('host.selectHost')}</span>
                    )}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronDownIcon
                      className="h-5 w-5 text-gray-400"
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
                  <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-hidden rounded-md bg-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50 border border-gray-700">
                    <div className="p-2">
                      <div className="relative">
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          className="w-full rounded-lg bg-gray-800 border border-gray-600 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                          placeholder={t('host.searchPlaceholder')}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="max-h-48 overflow-auto">
                      {filteredStaffList.length === 0 ? (
                        <div className="px-4 py-2 text-gray-400 text-center">
                          {t('host.noResults')}
                        </div>
                      ) : (
                        filteredStaffList.map((staff) => (
                          <Listbox.Option
                            key={staff.id}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-3 pl-4 pr-4 ${
                                active ? 'bg-gray-700 text-white' : 'text-gray-200'
                              }`
                            }
                            value={staff}
                          >
                            {({ selected }) => (
                              <div>
                                <div className={`block truncate ${
                                  selected ? 'font-medium text-white' : 'font-normal'
                                }`}>
                                  {staff.name}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {staff.jobTitle} • {staff.email}
                                </div>
                              </div>
                            )}
                          </Listbox.Option>
                        ))
                      )}
                    </div>
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>
        )}

        {showError && !selectedHost && (
          <p className="text-sm text-red-400">
            {t('host.errors.hostRequired')}
          </p>
        )}
      </div>
    </FormContainer>
  );
}