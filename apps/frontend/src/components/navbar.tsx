import { fetchUser } from '@/services/userService.ts';
import project_logo from '../assets/project-logo.png';
import AccountButton from './account-button.tsx';
import { useQuery } from '@tanstack/react-query';

const NavBar = ({ isPublic = false }: { isPublic?: boolean }) => {

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser
  });

  return (
    <div className="navbar w-full flex items-center justify-between p-3 z-20 fixed bg-white drop-shadow-md">
      <a className="flex items-center" href="/">
        <img src={project_logo} alt="Project Logo" className="h-9 w-9 mr-2" />
        <h1 className="font-extrabold text-3xl">OHsync</h1>
      </a>

      {!isPublic && <div className="flex gap-4 text-center justify-center items-center">
        <p className={`text-xl font-semibold ${user?.role.toLowerCase() === 'student'
            ? 'text-green-600'
            : 'text-red-600'
          }`}>
          {user?.role.toUpperCase() || 'UNKNOWN'}
        </p>
        <AccountButton />
      </div>}
    </div>
  );
};

export default NavBar;