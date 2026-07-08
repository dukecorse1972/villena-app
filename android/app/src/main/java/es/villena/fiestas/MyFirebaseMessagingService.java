package es.villena.fiestas;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import java.util.Map;

/**
 * Mensajes de FCM de avisos llegan como "data" puro (ver send-aviso-push),
 * así que este servicio se invoca SIEMPRE (app en primer plano, segundo
 * plano o cerrada) y construimos la notificación a mano.
 */
public class MyFirebaseMessagingService extends FirebaseMessagingService {

    private static final String CHANNEL_ID = "avisos";

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);

        Map<String, String> data = remoteMessage.getData();
        String title = data.get("title");
        String body = data.get("body");
        String avisoId = data.get("avisoId");
        if (title == null || body == null) return;

        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        ensureChannel(notificationManager);

        int notificationId = avisoId != null ? avisoId.hashCode() : (int) System.currentTimeMillis();

        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        // El plugin de Capacitor detecta el toque en una notificación de FCM
        // buscando este extra concreto en el Intent de arranque de la
        // Activity (así es como lo hace Android en su auto-display). Lo
        // replicamos a mano para que el "pushNotificationActionPerformed"
        // de la app siga disparándose igual que antes.
        String messageId = remoteMessage.getMessageId();
        intent.putExtra("google.message_id", messageId != null ? messageId : String.valueOf(notificationId));
        if (avisoId != null) intent.putExtra("avisoId", avisoId);

        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            notificationId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_aviso)
            .setColor(0xFF0B1A0B)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH);

        notificationManager.notify(notificationId, builder.build());
    }

    private void ensureChannel(NotificationManager notificationManager) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        if (notificationManager.getNotificationChannel(CHANNEL_ID) != null) return;

        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Avisos de la Junta Central",
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("Avisos oficiales de las Fiestas de Moros y Cristianos de Villena");
        notificationManager.createNotificationChannel(channel);
    }
}
