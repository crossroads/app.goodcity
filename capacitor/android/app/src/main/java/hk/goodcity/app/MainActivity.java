package hk.goodcity.app;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;

import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  private boolean systemBarInsetsListenerAttached;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Edge-to-edge + decor background so @color/goodcity_blue shows behind transparent
    // system bars on Android 15+ (API 35), where setStatusBarColor/setNavigationBarColor
    // are no longer applied for the default edge-to-edge window.
    applyWindowSystemBarDecorOnce();
  }

  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);

    // BridgeActivity uses Capacitor's internal layout (not our activity_main.xml),
    // so attach insets to the real content root once the view hierarchy exists.
    if (!hasFocus || systemBarInsetsListenerAttached) {
      return;
    }

    attachSystemBarInsetsListener();
    systemBarInsetsListenerAttached = true;
  }

  /** One-time window decor: edge-to-edge, background, bar colors (API 34-), light/dark appearance. */
  private void applyWindowSystemBarDecorOnce() {
    Window window = getWindow();
    int goodcityBlue = ContextCompat.getColor(this, R.color.goodcity_blue);

    WindowCompat.setDecorFitsSystemWindows(window, false);
    window.getDecorView().setBackgroundColor(goodcityBlue);

    // Still honored on API 34 and below when not fully edge-to-edge; no-op on API 35+.
    if (Build.VERSION.SDK_INT < 35) {
      window.setStatusBarColor(goodcityBlue);
      window.setNavigationBarColor(goodcityBlue);
    }

    WindowInsetsControllerCompat controller =
        WindowCompat.getInsetsController(window, window.getDecorView());
    if (controller != null) {
      controller.setAppearanceLightStatusBars(false);
      controller.setAppearanceLightNavigationBars(false);
    }
  }

  /** Padding for system bar insets on android.R.id.content (after decor is ready). */
  private void attachSystemBarInsetsListener() {
    View content = findViewById(android.R.id.content);
    if (content == null) {
      return;
    }

    ViewCompat.setOnApplyWindowInsetsListener(
        content,
        (v, insets) -> {
          Insets bars =
              insets.getInsets(
                  WindowInsetsCompat.Type.systemBars()
                      | WindowInsetsCompat.Type.displayCutout());
          // Do not apply bars.top here: the WebView already gets top inset via
          // CSS env(safe-area-inset-top) on body (see app/styles/app.scss). Applying
          // native top padding as well stacks and looks like double top spacing on Android.
          v.setPadding(bars.left, 0, bars.right, bars.bottom);
          return insets;
        });

    ViewCompat.requestApplyInsets(content);
  }
}
