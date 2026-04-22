package hk.goodcity.app;

import android.os.Bundle;
import android.view.View;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Handle edge-to-edge + apply system bar insets as padding so
    // web content doesn't underlap the status/navigation bars.
    WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

    View container = findViewById(R.id.main_container);
    if (container != null) {
      ViewCompat.setOnApplyWindowInsetsListener(
        container,
        (v, insets) -> {
          Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
          v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
          return insets;
        }
      );
    }
  }
}
