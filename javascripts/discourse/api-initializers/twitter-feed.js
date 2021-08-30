import { apiInitializer } from "discourse/lib/api";

const config = {
  sidebar_container: 'twitter-sidebar',
  sidebar_mainpage_container: 'latest-topic-list'
};

/**
 * 
 * @param {string} raw string, that contains settings from user input
 * @returns {object} settings
 * 
 */

function parseSetup(raw) {
  const parsed = {};

  raw.split('|').forEach(item => {
    const [path, screenName] = item.split(':').map(str => str.trim());

    if (!path || !screenName) {
      throw 'Incorrect settings recieved';
    }
    
    parsed[path] = screenName;
  });
  return parsed;
}

/**
 * 
 * @param {string} screenName Twitter screenName e.g. - aoc 
 * 
 * This function search in the DOM for sidebar and
 * creates Twitter timeline
 * 
 */

function insertTimeline(screenName) {
  let twitterSidebar = document.getElementById(config.sidebar_container);
  const sidebar = document.getElementById('sidebar');

  if (!twitterSidebar) {
      const container = document.getElementsByClassName(config.sidebar_mainpage_container);
      if (!twitterSidebar && !container.length) {
          console.warn('Twitter timeline not loaded');
          return;
      }
      
      twitterSidebar = container[0].parentNode;
  }

  sidebar.classList.remove('sb-loading');

  const iframe_width = twitterSidebar.style.width;
  const iframe_height = twitterSidebar.style.height;

  try {
    twttr.widgets.createTimeline(
      {
        sourceType: 'profile',
        screenName
      },
      twitterSidebar,
      {
        width: iframe_width,
        height: iframe_height,
        chrome: 'noborders'
      }
    );
  }
  catch (err) {
    console.error(err.msg || err.message);
  }
}

/**
 * 
 * @param {string} doc_path current URL (pathname)
 * @param {object} paths_relations object that contains settings (path: screenName)
 * @returns {string} screenName, that should be used to render timeline
 * 
 */

function parsePath(doc_path, paths_relations) {
  let response = 'layer5';

  Object.keys(paths_relations)
    .forEach(path => {
      
      if (doc_path.includes(path)) {
        response = paths_relations[path];
      }
    });

  return response;
}

/**
 * 
 * Discourse plugin API initializer
 * 
 */

export default apiInitializer("0.11.1", api => {
  api.createWidget('twitter-widget', {
    tagName: `div#${config.sidebar_container}`,

    init() {
      const paths_relations = parseSetup(settings.paths_relations);

      /**
       * 
       * api.onPageChange will be fired after every page refresh / route change
       * after the DOM will be ready
       * 
       */
      api.onPageChange(url => {
        insertTimeline(
          parsePath(url, paths_relations)
        );
      });
    },
  });
});
