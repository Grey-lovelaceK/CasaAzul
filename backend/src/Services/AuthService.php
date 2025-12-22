<?php



namespace App\Services;

use App\Repositories\ProfesorRepository;

class AuthService
{
    private ProfesorRepository $profesorRepository;

    public function __construct()
    {
        $this->profesorRepository = new ProfesorRepository();
    }

    public function login(string $email, string $password): array
    {
        try {

            $profesor = $this->profesorRepository->findByEmail($email);

            if (!$profesor) {
                return [
                    'success' => false,
                    'message' => 'Credenciales inválidas'
                ];
            }


            if (!password_verify($password, $profesor['password'])) {
                return [
                    'success' => false,
                    'message' => 'Credenciales inválidas'
                ];
            }


            if ($profesor['id_estado'] != 16) {
                return [
                    'success' => false,
                    'message' => 'Usuario inactivo. Contacte al administrador'
                ];
            }


            session_start();
            $_SESSION['user_id'] = $profesor['id_profesor'];
            $_SESSION['user_email'] = $profesor['email'];
            $_SESSION['user_name'] = $profesor['nombres'] . ' ' . $profesor['apellido_paterno'];


            unset($profesor['password']);

            return [
                'success' => true,
                'user' => $profesor,
                'token' => session_id()
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al procesar login: ' . $e->getMessage()
            ];
        }
    }


    public function getUserById(int $id): ?array
    {
        $profesor = $this->profesorRepository->findById($id);

        if ($profesor) {
            unset($profesor['password']);
        }

        return $profesor;
    }


    public function changePassword(int $userId, string $currentPassword, string $newPassword): array
    {
        try {
            $profesor = $this->profesorRepository->findById($userId);

            if (!$profesor) {
                return [
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ];
            }

            if (!password_verify($currentPassword, $profesor['password'])) {
                return [
                    'success' => false,
                    'message' => 'Contraseña actual incorrecta'
                ];
            }

            if (strlen($newPassword) < 8) {
                return [
                    'success' => false,
                    'message' => 'La contraseña debe tener al menos 8 caracteres'
                ];
            }

            $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
            $this->profesorRepository->updatePassword($userId, $hashedPassword);

            return [
                'success' => true,
                'message' => 'Contraseña actualizada correctamente'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al cambiar contraseña: ' . $e->getMessage()
            ];
        }
    }


    public static function hashPassword(string $password): string
    {
        return password_hash($password, PASSWORD_BCRYPT);
    }
}
