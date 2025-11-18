/**
 * User DTOs and Types
 * These mirror the NestJS DTOs
 */

export interface CreateUserDto {
  username: string
  email: string
  password: string
}

export interface UpdateUserDto {
  username?: string
  email?: string
  password?: string
}

export interface UserResponse {
  id: number
  username: string
  email: string
  createdAt: Date
  updatedAt: Date
}
