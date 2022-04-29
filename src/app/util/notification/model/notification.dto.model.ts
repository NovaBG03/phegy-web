export interface NotificationDto {
  id: number;
  title: string;
  message: string;
  category: string;
}

export interface NotificationDtoList {
  notifications: NotificationDto[];
}
