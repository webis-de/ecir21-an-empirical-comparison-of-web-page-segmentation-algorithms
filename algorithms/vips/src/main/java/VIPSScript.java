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

public class VIPSScript extends InteractionScript {

  //////////////////////////////////////////////////////////////////////////////
  // LOGGING
  //////////////////////////////////////////////////////////////////////////////

  private static final Logger LOG =
      Logger.getLogger(VIPSScript.class.getName());

  //////////////////////////////////////////////////////////////////////////////
  // MEMBERS
  //////////////////////////////////////////////////////////////////////////////

  private final String vipsJs;

  private final int pDoC;

  //////////////////////////////////////////////////////////////////////////////
  // CONSTRUCTORS
  //////////////////////////////////////////////////////////////////////////////

  public VIPSScript(final Path scriptDirectory)
  throws IOException {
    super(scriptDirectory);

    LOG.info("Loading pDoC from pdoc.txt");
    this.pDoC = Integer.valueOf(new Scanner(scriptDirectory.resolve("pdoc.txt")).useDelimiter("\\A").next());
    LOG.info("Permitted Degree of Coherence is " + this.pDoC);

    LOG.info("Loading VIPS script");
    this.vipsJs = new Scanner(scriptDirectory.resolve("vipsjs.js")).useDelimiter("\\A").next()
      + "\nvar tester = new VipsTester();\nreturn tester.main(\"TBFWID\"," + this.pDoC + ");";
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
    this.executeVips(browser, window, outputDirectory);
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

  protected void executeVips(final Browser browser, final WebDriver window, final Path outputDirectory)
  throws Throwable {
    LOG.info("Executing VIPS");
    JavascriptExecutor jsExecutor = (JavascriptExecutor) window;
    String json = (String) jsExecutor.executeScript(this.vipsJs);
    LOG.info("Writing result to " + outputDirectory.toString() + "/vips.json");
    try (final Writer writer = new OutputStreamWriter(new FileOutputStream(
            outputDirectory.resolve("vips.json").toFile()), "UTF-8")) {
      writer.write(json);
    }
  }
}
