package hk.goodcity.app;

import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.view.View;

import androidx.core.view.WindowInsetsControllerCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Apply system bar styling as early as possible (splash theme can otherwise keep white bars).
    Window window = getWindow();
    window.getDecorView().setBackgroundColor(0xFF0B2B4D);
    window.setStatusBarColor(0xFF0B2B4D);
    window.setNavigationBarColor(0xFF0B2B4D);
    WindowInsetsControllerCompat controller =
      WindowCompat.getInsetsController(window, window.getDecorView());
    if (controller != null) {
      controller.setAppearanceLightStatusBars(false);
      controller.setAppearanceLightNavigationBars(false);
    }
  }

  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);

    // BridgeActivity uses Capacitor's internal layout (not our activity_main.xml),
    // so apply insets to the real content root once the view hierarchy exists.
    if (!hasFocus) return;

    Window window = getWindow();
    WindowCompat.setDecorFitsSystemWindows(window, false);

    // Make system bars match app theme and keep icons readable.
    window.setStatusBarColor(0xFF0B2B4D);
    window.setNavigationBarColor(0xFF0B2B4D);
    WindowInsetsControllerCompat controller =
      WindowCompat.getInsetsController(window, window.getDecorView());
    if (controller != null) {
      controller.setAppearanceLightStatusBars(false);
      controller.setAppearanceLightNavigationBars(false);
    }

    View content = findViewById(android.R.id.content);
    if (content == null) return;

    ViewCompat.setOnApplyWindowInsetsListener(
      content,
      (v, insets) -> {
        Insets bars = insets.getInsets(
          WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
        );
        // Do not apply bars.top here: the WebView already gets top inset via
        // CSS env(safe-area-inset-top) on body (see app/styles/app.scss). Applying
        // native top padding as well stacks and looks like double top spacing on Android.
        v.setPadding(bars.left, 0, bars.right, bars.bottom);
        return insets;
      }
    );

    ViewCompat.requestApplyInsets(content);
  }
}
