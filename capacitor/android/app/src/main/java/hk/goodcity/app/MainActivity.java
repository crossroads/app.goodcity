package hk.goodcity.app;

import android.view.View;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);

    // BridgeActivity uses Capacitor's internal layout (not our activity_main.xml),
    // so apply insets to the real content root once the view hierarchy exists.
    if (!hasFocus) return;

    WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

    View content = findViewById(android.R.id.content);
    if (content == null) return;

    ViewCompat.setOnApplyWindowInsetsListener(
      content,
      (v, insets) -> {
        Insets bars = insets.getInsets(
          WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
        );
        v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
        return insets;
      }
    );

    ViewCompat.requestApplyInsets(content);
  }
}
