import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Settings, Save } from 'lucide-react';
import { getCustomAppContext } from '@kontent-ai/custom-app-sdk';
import { storage } from '../utils/storage';

export default function Header() {
  const [environmentId, setEnvironmentId] = useState('');
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRoles, setUserRoles] = useState([]);
  const [config, setConfig] = useState(null);
  const [isLocalDev, setIsLocalDev] = useState(false);
  const [localEnvironmentId, setLocalEnvironmentId] = useState('');
  const [showLocalSettings, setShowLocalSettings] = useState(false);
  const [showUserIdTooltip, setShowUserIdTooltip] = useState(false);
  const [showRoleIdTooltip, setShowRoleIdTooltip] = useState(false);

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const response = await getCustomAppContext();

        if (response.isError) {
          console.error({
            errorCode: response.code,
            description: response.description,
          });
          // If we can't get custom app context, we're likely in local development
          setIsLocalDev(true);
          const storedEnvId = storage.getEnvironmentId();
          setLocalEnvironmentId(storedEnvId || '');

          // Load stored user info for local development
          const storedUserInfo = storage.getUserInfo();
          if (storedUserInfo) {
            setUserId(storedUserInfo.userId);
            setUserEmail(storedUserInfo.userEmail);
            setUserRoles(storedUserInfo.userRoles);
          }
        } else {
          console.log({
            config: response.config,
            context: response.context,
          });

          setEnvironmentId(response.context.environmentId || '');
          setUserId(response.context.userId || '');
          setUserEmail(response.context.userEmail || '');
          setUserRoles(response.context.userRoles || []);
          setConfig(response.config || null);
          setIsLocalDev(false);

          // Store user info in browser storage for local development
          if (response.context.userId) {
            storage.setUserInfo({
              userId: response.context.userId,
              userEmail: response.context.userEmail,
              userRoles: response.context.userRoles,
            });
          }
        }
      } catch (error) {
        console.log('Running in local development mode');
        setIsLocalDev(true);
        const storedEnvId = storage.getEnvironmentId();
        setLocalEnvironmentId(storedEnvId || '');

        // Load stored user info for local development
        const storedUserInfo = storage.getUserInfo();
        if (storedUserInfo) {
          setUserId(storedUserInfo.userId);
          setUserEmail(storedUserInfo.userEmail);
          setUserRoles(storedUserInfo.userRoles);
        }
      }
    };

    fetchContext();
  }, []);

  const handleSaveEnvironment = () => {
    if (localEnvironmentId.trim()) {
      // Store environment ID
      storage.setEnvironmentId(localEnvironmentId.trim());

      // Reload the page to apply the new environment
      window.location.reload();
    }
  };

  return (
    <header className='bg-white shadow-sm border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='flex items-center'>
                <div className='p-2 bg-primary-100 rounded-lg mr-3'>
                  <Shield className='h-6 w-6 text-primary-600' />
                </div>
                <div>
                  <h1 className='text-xl font-bold text-gray-900'>
                    Validate Content App
                  </h1>
                  <p className='text-sm text-gray-500'>
                    Kontent.ai Content Validation Tool
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className='flex items-center space-x-4'>
            {!isLocalDev && userId && userEmail && (
              <div className='flex items-center text-sm text-gray-500 relative'>
                <span className='mr-2'>👤</span>
                <span
                  className='font-medium cursor-help border-b border-dotted border-gray-400'
                  onMouseEnter={() => setShowUserIdTooltip(true)}
                  onMouseLeave={() => setShowUserIdTooltip(false)}
                >
                  {userEmail}
                </span>
                <span className='mx-2'>•</span>
                <span
                  className='font-medium cursor-help border-b border-dotted border-gray-400'
                  onMouseEnter={() => setShowRoleIdTooltip(true)}
                  onMouseLeave={() => setShowRoleIdTooltip(false)}
                >
                  {userRoles?.[0]?.codename || 'Unknown Role'}
                </span>

                {/* User ID Tooltip */}
                {showUserIdTooltip && (
                  <div className='absolute top-full mt-2 left-0 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-20 whitespace-nowrap'>
                    User ID: {userId}
                  </div>
                )}

                {/* Role ID Tooltip */}
                {showRoleIdTooltip && (
                  <div className='absolute top-full mt-2 right-0 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-20 whitespace-nowrap'>
                    Role ID: {userRoles?.[0]?.id || 'Unknown'}
                  </div>
                )}
              </div>
            )}
            {isLocalDev && (
              <button
                onClick={() => setShowLocalSettings(!showLocalSettings)}
                className='btn-secondary flex items-center text-sm'
              >
                <Settings className='h-4 w-4 mr-2' />
                Environment Settings
              </button>
            )}
          </div>
        </div>

        {/* Local Development Environment Settings */}
        {isLocalDev && (
          <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='text-sm font-medium text-gray-700'>
                Environment Settings
              </h3>
              <button
                onClick={() => setShowLocalSettings(!showLocalSettings)}
                className='text-gray-500 hover:text-gray-700'
              >
                <Settings size={16} />
              </button>
            </div>

            {showLocalSettings && (
              <div className='space-y-3'>
                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>
                    Environment ID
                  </label>
                  <input
                    type='text'
                    value={localEnvironmentId}
                    onChange={(e) => setLocalEnvironmentId(e.target.value)}
                    placeholder='Enter Environment ID'
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <button
                  onClick={handleSaveEnvironment}
                  disabled={!localEnvironmentId.trim()}
                  className='flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <Save size={16} className='mr-2' />
                  Save
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
