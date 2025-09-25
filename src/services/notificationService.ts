// Notification service for push notifications and in-app notifications
import { firebaseFirestore, FieldValue } from '../config/firebase';
import { RideNotification, NotificationType } from '../types/ride';

class NotificationService {
  private static instance: NotificationService;
  private readonly NOTIFICATIONS_COLLECTION = 'notifications';

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Create a notification
  async createNotification(
    userId: string,
    userType: 'customer' | 'driver',
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<string> {
    try {
      const notification: Omit<RideNotification, 'id'> = {
        userId,
        userType,
        type,
        title,
        message,
        data,
        read: false,
        createdAt: FieldValue.serverTimestamp() as any,
      };

      const docRef = await firebaseFirestore
        .collection(this.NOTIFICATIONS_COLLECTION)
        .add(notification);

      console.log('Notification created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Send ride request notification to driver
  async sendRideRequestNotification(
    driverId: string,
    rideId: string,
    pickup: string,
    destination: string
  ): Promise<void> {
    await this.createNotification(
      driverId,
      'driver',
      'ride_request',
      'New Ride Request',
      `Pickup: ${pickup}\nDestination: ${destination}`,
      { rideId, pickup, destination }
    );
  }

  // Send ride accepted notification to customer
  async sendRideAcceptedNotification(
    customerId: string,
    rideId: string,
    driverName: string,
    estimatedArrival: number
  ): Promise<void> {
    await this.createNotification(
      customerId,
      'customer',
      'ride_accepted',
      'Ride Accepted!',
      `${driverName} is on the way. Estimated arrival: ${estimatedArrival} minutes`,
      { rideId, driverName, estimatedArrival }
    );
  }

  // Send driver arriving notification to customer
  async sendDriverArrivingNotification(
    customerId: string,
    rideId: string,
    driverName: string
  ): Promise<void> {
    await this.createNotification(
      customerId,
      'customer',
      'driver_arriving',
      'Driver Arriving',
      `${driverName} is almost at your pickup location`,
      { rideId, driverName }
    );
  }

  // Send driver arrived notification to customer
  async sendDriverArrivedNotification(
    customerId: string,
    rideId: string,
    driverName: string
  ): Promise<void> {
    await this.createNotification(
      customerId,
      'customer',
      'driver_arrived',
      'Driver Arrived',
      `${driverName} has arrived at your pickup location`,
      { rideId, driverName }
    );
  }

  // Send ride started notification to customer
  async sendRideStartedNotification(
    customerId: string,
    rideId: string,
    destination: string
  ): Promise<void> {
    await this.createNotification(
      customerId,
      'customer',
      'ride_started',
      'Ride Started',
      `Your ride to ${destination} has started`,
      { rideId, destination }
    );
  }

  // Send ride completed notification
  async sendRideCompletedNotification(
    userId: string,
    userType: 'customer' | 'driver',
    rideId: string,
    totalAmount?: number
  ): Promise<void> {
    const message = userType === 'customer' 
      ? `Your ride has been completed${totalAmount ? `. Total: ${totalAmount} JOD` : ''}`
      : 'Ride completed successfully';

    await this.createNotification(
      userId,
      userType,
      'ride_completed',
      'Ride Completed',
      message,
      { rideId, totalAmount }
    );
  }

  // Send ride cancelled notification
  async sendRideCancelledNotification(
    userId: string,
    userType: 'customer' | 'driver',
    rideId: string,
    reason?: string
  ): Promise<void> {
    const message = reason 
      ? `Your ride has been cancelled. Reason: ${reason}`
      : 'Your ride has been cancelled';

    await this.createNotification(
      userId,
      userType,
      'ride_cancelled',
      'Ride Cancelled',
      message,
      { rideId, reason }
    );
  }

  // Get user notifications
  async getUserNotifications(
    userId: string,
    limit: number = 50
  ): Promise<RideNotification[]> {
    try {
      const snapshot = await firebaseFirestore
        .collection(this.NOTIFICATIONS_COLLECTION)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const notifications: RideNotification[] = [];
      snapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() } as RideNotification);
      });

      return notifications;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await firebaseFirestore
        .collection(this.NOTIFICATIONS_COLLECTION)
        .doc(notificationId)
        .update({
          read: true,
          readAt: FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all user notifications as read
  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      const snapshot = await firebaseFirestore
        .collection(this.NOTIFICATIONS_COLLECTION)
        .where('userId', '==', userId)
        .where('read', '==', false)
        .get();

      const batch = firebaseFirestore.batch();
      snapshot.forEach((doc) => {
        batch.update(doc.ref, {
          read: true,
          readAt: FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Subscribe to user notifications
  subscribeToUserNotifications(
    userId: string,
    callback: (notifications: RideNotification[]) => void
  ): () => void {
    const unsubscribe = firebaseFirestore
      .collection(this.NOTIFICATIONS_COLLECTION)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .onSnapshot(
        (snapshot) => {
          const notifications: RideNotification[] = [];
          snapshot.forEach((doc) => {
            notifications.push({ id: doc.id, ...doc.data() } as RideNotification);
          });
          callback(notifications);
        },
        (error) => {
          console.error('Error subscribing to user notifications:', error);
        }
      );

    return unsubscribe;
  }

  // Get unread notification count
  async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      const snapshot = await firebaseFirestore
        .collection(this.NOTIFICATIONS_COLLECTION)
        .where('userId', '==', userId)
        .where('read', '==', false)
        .get();

      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      return 0;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await firebaseFirestore
        .collection(this.NOTIFICATIONS_COLLECTION)
        .doc(notificationId)
        .delete();
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Delete all user notifications
  async deleteAllUserNotifications(userId: string): Promise<void> {
    try {
      const snapshot = await firebaseFirestore
        .collection(this.NOTIFICATIONS_COLLECTION)
        .where('userId', '==', userId)
        .get();

      const batch = firebaseFirestore.batch();
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error deleting all user notifications:', error);
      throw error;
    }
  }
}

export const notificationService = NotificationService.getInstance();
