import de.webis.webarchive.common.Version;
import de.webis.webarchive.environment.browsers.Browser;
import de.webis.webarchive.environment.browsers.Windows;
import de.webis.webarchive.environment.scripts.InteractionScript;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.file.Path;
import java.util.Scanner;
import java.util.logging.Logger;

public class HEPSScript extends InteractionScript {
  //////////////////////////////////////////////////////////////////////////////
  // LOGGING
  //////////////////////////////////////////////////////////////////////////////

  private static final Logger LOG =
          Logger.getLogger(HEPSScript.class.getName());

  //////////////////////////////////////////////////////////////////////////////
  // CONSTANTS
  //////////////////////////////////////////////////////////////////////////////

  public static final String NAME = "hepsScript";

  public static final Version VERSION = new Version(1, 1, 0);

  //////////////////////////////////////////////////////////////////////////////
  // CONSTRUCTORS
  //////////////////////////////////////////////////////////////////////////////

  public HEPSScript(final Path scriptDirectory)
  throws IOException {
    super(scriptDirectory);
  }
  
  //////////////////////////////////////////////////////////////////////////////
  // FUNCTIONALITY
  //////////////////////////////////////////////////////////////////////////////

  @Override
  protected void executeInteraction(
          final Browser browser, final String startUrl, final Path outputDirectory)
          throws Throwable {
    final WebDriver window = browser.openWindow(startUrl);
    this.scrollDown(browser, window);
    this.executeHEPS(browser, window, outputDirectory);
  }

  protected void scrollDown(final Browser browser, final WebDriver window) {
    final long quietPeriodInSeconds = 3;
    final long waitTimeoutInSeconds = 10;
    browser.waitForQuiescence(quietPeriodInSeconds, waitTimeoutInSeconds);

    // Enough to reach "click for more"-button of google image search
    final int maxScrollings = 25;
    for (int scrollings = 0; scrollings < maxScrollings; ++scrollings) {
      final int scrollPosition = Windows.getScrollYPosition(window);
      final int scrollHeight = Windows.getScrollHeight(window);
      if (scrollPosition >= scrollHeight) { break; }

      LOG.info("Scrolling down " + (scrollings + 1)
              + " from " + scrollPosition + "/" + scrollHeight);
      Windows.scrollDownOneWindow(window);
      browser.waitForQuiescence(quietPeriodInSeconds, waitTimeoutInSeconds);
    }

    final int scrollPosition = Windows.getScrollYPosition(window);
    final int scrollHeight = Windows.getScrollHeight(window);
    LOG.info("Scrolled down to " + scrollPosition + "/" + scrollHeight);

    Windows.scrollToTop(window);
    LOG.info("Resize viewport height to " + scrollHeight);
    Windows.resizeViewportHeight(window, scrollHeight);
    browser.waitForQuiescence(quietPeriodInSeconds, waitTimeoutInSeconds);
  }

  protected void executeHEPS(
          final Browser browser, final WebDriver window, final Path outputDirectory)
  throws Throwable {
    LOG.info("Loading HEPS script");
    String hepsJs = new Scanner(getClass().getResourceAsStream("/HEPS.user.js")).useDelimiter("\\A").next();
    JavascriptExecutor jsExecutor = (JavascriptExecutor) window;

    LOG.info("Executing HEPS");
    jsExecutor.executeScript(hepsJs);
    LOG.info("Retrieving result");
    String json = (String) jsExecutor.executeScript("return window.HEPS.json");
    LOG.info("Writing result to " + outputDirectory.toString() + "/out.json");
    try (final Writer writer = new OutputStreamWriter(new FileOutputStream(
            outputDirectory.resolve("out.json").toFile()), "UTF-8")) {
      writer.write(json);
    }
  }
}
