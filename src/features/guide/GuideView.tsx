export function GuideView() {
  return (
    <div className="px-6 md:px-12 py-10 fade-in">
      <div className="section-num">guide · how to use</div>
      <h1 className="serif text-5xl mt-2 mb-6 lowercase">user guide</h1>

      <div className="space-y-8 text-sm leading-relaxed text-[var(--muted)] max-w-4xl">
        <section>
          <h2 className="serif text-xl mb-2 lowercase">what this tool is</h2>
          <p>
            A study companion for Gate AE aspirants. Use it to track your syllabus progress, keep
            PDFs organized, save resources, store formulas, and monitor your overall preparation.
          </p>
        </section>

        <section>
          <h2 className="serif text-xl mb-2 lowercase">syllabus</h2>
          <p>
            This is the core tracker. Each section contains core and special topics. Tick a topic
            when you finish it, and the app updates your completion percentage automatically.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>mark topics complete as you study</li>
            <li>use the notes box to capture doubts or formula reminders</li>
            <li>section progress helps you focus where you need it most</li>
          </ul>
        </section>

        <section>
          <h2 className="serif text-xl mb-2 lowercase">books</h2>
          <p>
            This section shows PDFs by AE section. Keep your files grouped in the matching folder so
            they appear here cleanly.
          </p>
          <p className="mt-2">
            Books are useful for quick access to your reference PDFs while studying.
          </p>
        </section>

        <section>
          <h2 className="serif text-xl mb-2 lowercase">resources</h2>
          <p>
            Save videos, playlists, and links related to a section. This is the main place to
            collect your study media.
          </p>
          <p className="mt-2">
            Use the section selector, add a title if you want, paste the URL, and click add.
          </p>
          <p className="mt-2">
            YouTube playlists become courses: the app loads each video with its title and thumbnail,
            lets you tick videos as watched, and shows your playlist progress.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <h3 className="serif text-base mb-2 lowercase">watching videos</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Each video has a <strong>watch button</strong> that opens the player directly
                  inside the app — no leaving the page or dealing with YouTube's sidebar and
                  distrcations from it. The <strong>external link</strong> is still available if you
                  prefer to open it on YouTube.
                </li>
                <li>
                  Watch at <strong>1x, 1.5x, or 2x speed</strong> and the app tracks how much of the
                  video you have actually seen.
                </li>
                <li>
                  <strong>Dragging the slider forward does not count</strong> as watched time. Only
                  time spent actually watching is counted.
                </li>
                <li>
                  A <strong>live progress bar</strong> below the player shows your watched
                  percentage in real time.
                </li>
                <li>
                  Once you reach <strong>90% watched</strong>, the video is{" "}
                  <strong>automatically ticked as complete</strong>.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="serif text-base mb-2 lowercase">progress is saved</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Your watch progress for every video is{" "}
                  <strong>saved automatically every few seconds</strong>, on pause, and when you
                  close or switch tabs.
                </li>
                <li>
                  If you switch to another section, close the browser, or come back days later,{" "}
                  <strong>the player resumes from where you left off</strong> and your watched
                  percentage is restored.
                </li>
                <li>You do not need to do anything for this to work.</li>
              </ul>
            </div>

            <div>
              <h3 className="serif text-base mb-2 lowercase">removing a playlist or link</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Removing any playlist or link will show a{" "}
                  <strong>confirmation dialog before anything is deleted</strong> — this applies to
                  all removals, not just ones where you have finished videos.
                </li>
                <li>
                  If you have watch progress on that playlist, the message will note that{" "}
                  <strong>your saved progress will also be cleared</strong> along with the playlist.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="serif text-xl mb-2 lowercase">youtube data api key</h2>
          <p>
            Playlist loading requires a YouTube Data API key. This key allows the app to fetch video
            details from your playlists. It is free to set up and is a one-time process.{" "}
            <strong>The key is stored only in your browser and never leaves your machine.</strong>
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <h3 className="serif text-base mb-1 lowercase">step 1: open google cloud console</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>
                  Go to{" "}
                  <a
                    href="https://console.cloud.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="link-u"
                  >
                    console.cloud.google.com
                  </a>
                </li>
                <li>
                  If you are not logged in, click <strong>Sign In</strong> in the top right and use
                  your Google account.
                </li>
              </ol>
            </div>

            <div>
              <h3 className="serif text-base mb-1 lowercase">step 2: create a new project</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>
                  At the top left, click the dropdown that says <strong>Select a Project</strong> or
                  shows a project name.
                </li>
                <li>
                  A popup will appear. Click <strong>NEW PROJECT</strong> in the top right.
                </li>
                <li>
                  Enter a project name such as <span className="mono">gate-ae</span> or{" "}
                  <span className="mono">prep-tracker</span>.
                </li>
                <li>
                  Click <strong>CREATE</strong> and wait a few seconds for the project to be ready.
                </li>
              </ol>
            </div>

            <div>
              <h3 className="serif text-base mb-1 lowercase">
                step 3: enable the youtube data api
              </h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>
                  In the left sidebar, click <strong>APIs &amp; Services</strong>, then{" "}
                  <strong>Library</strong>.
                </li>
                <li>
                  Search for <span className="mono">YouTube Data API</span> and press Enter.
                </li>
                <li>
                  Click <strong>YouTube Data API v3</strong> from the results.
                </li>
                <li>
                  Click the blue <strong>ENABLE</strong> button and wait for it to activate.
                </li>
              </ol>
            </div>

            <div>
              <h3 className="serif text-base mb-1 lowercase">step 4: create an api key</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>
                  Click <strong>CREATE CREDENTIALS</strong> after the API is enabled.
                </li>
                <li>
                  When asked what data you are using, select <strong>Public Data</strong>.
                </li>
                <li>
                  Confirm that <strong>YouTube Data API v3</strong> is selected, then click{" "}
                  <strong>NEXT</strong>.
                </li>
                <li>
                  Click <strong>CREATE API KEY</strong>. A popup will show your new key, which
                  starts with <span className="mono">AIza...</span>
                </li>
                <li>Copy the key using the copy icon or Ctrl+C (Cmd+C on Mac).</li>
              </ol>
            </div>

            <div>
              <h3 className="serif text-base mb-1 lowercase">step 5: add the key to the app</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>
                  Open the app and click the <strong>resources</strong> tab.
                </li>
                <li>
                  At the top, find the box labeled <strong>yt data api key</strong>.
                </li>
                <li>
                  Click <strong>show</strong> to reveal the input field.
                </li>
                <li>Paste the key you copied (Ctrl+V or Cmd+V).</li>
                <li>
                  <strong>The app saves the key automatically.</strong> You should see a
                  confirmation message.
                </li>
              </ol>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="serif text-base mb-1 lowercase">if something goes wrong</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <span className="mono">Error: Invalid API key</span> — check that you copied the{" "}
                <strong>entire key</strong>. It must start with <span className="mono">AIza</span>.
              </li>
              <li>
                <span className="mono">API not enabled</span> — go back to the Google Cloud console
                and confirm you clicked <strong>ENABLE</strong> for YouTube Data API v3.
              </li>
              <li>
                <span className="mono">Quota exceeded</span> — the free tier allows a set number of
                API calls per day. <strong>Wait 24 hours and try again.</strong> For normal prep
                use, hitting this limit is unlikely.
              </li>
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="serif text-base mb-1 lowercase">without a key</h3>
            <p>
              You can still save individual video links and general study links, and manually track
              videos in your notes. What you <strong>cannot</strong> do is auto-load playlist videos
              with titles and thumbnails, or track watch progress for entire playlists.
            </p>
          </div>

          <div className="mt-4">
            <h3 className="serif text-base mb-1 lowercase">security note</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>The key is stored locally in your browser only.</strong>
              </li>
              <li>It is not sent to any server except Google's API to fetch playlist data.</li>
              <li>You can delete or regenerate the key anytime from the Google Cloud console.</li>
              <li>Normal prep use will not exceed the free tier limits.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="serif text-xl mb-2 lowercase">formulas</h2>
          <p>
            Use this section as a formula notebook. Add the formulas you want to remember for each
            section, and keep them short and easy to scan.
          </p>
        </section>

        <section>
          <h2 className="serif text-xl mb-2 lowercase">log</h2>
          <p>
            The log gives you an at-a-glance overview of how far along your prep is. Use it to spot
            sections that need more work.
          </p>
        </section>

        <section>
          <h2 className="serif text-xl mb-2 lowercase">privacy</h2>
          <p>
            Your data stays in your browser. There is no login required, and nothing is stored on a
            server.{" "}
            <strong>
              Clearing browser storage will delete your saved progress, notes, and resources.
            </strong>
          </p>
        </section>
      </div>
    </div>
  );
}
