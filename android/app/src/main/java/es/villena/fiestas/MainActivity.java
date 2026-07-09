package es.villena.fiestas;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  // El indicador de scroll nativo de Android (franja que aparece al hacer
  // scroll y se desvanece) no se puede ocultar desde CSS: lo dibuja el
  // propio WebView, no el contenido web. Se desactiva aquí explícitamente
  // a petición de producto — no afecta a iOS, que no expone este control.
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    getBridge().getWebView().setVerticalScrollBarEnabled(false);
    getBridge().getWebView().setHorizontalScrollBarEnabled(false);
  }
}
