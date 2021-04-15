{
  {
    {
      {
        {
          {
            var testFolderName = "test-folder";
            var distFilesArray = [];
            var child_process = require("child_process");
            var path = require("path");
            var fs = require("fs");
            function folderFileTree(ld) {
              var file_lst = [];
              fs.readdirSync(ld).forEach((directory) => {
                var nPath = path.join(ld, directory);
                if (fs.statSync(nPath).isDirectory()) {
                  file_lst = [...file_lst, ...folderFileTree(nPath)];
                } else { 
                  file_lst.push(nPath);
                }
              });
              return file_lst;
            }
            console.log(folderFileTree(testFolderName));
            cleanTextList = (k) =>
              k
                .filter((e) => e != null)
                .map((e) => e.trim())
                .filter((e) => e != null && e != "");

            function uniq(k) {
              var map = {};
              k.forEach((element) => {
                if (element != null && element != "") map[element] = element;
              });
              return Object.values(map);
            }
            console.log("github.event ", github.event);
            var wordInCommits = [];
            var affectedFiles = [];

            if (context.payload.pull_request != null) {
              // if its a pull request
              var self_url = context.payload.pull_request._links.self.href;
              // var pr = await github.request(self_url);
              // var cmts = await github.request(self_url + "/commits");
              // var fls = await github.request(self_url + "/files");

              cmts = cmts.data
                .map((D) => (D.commit || {}).message)
                .filter((k) => k != null);

              wordInCommits = cleanTextList(pr.data.title.split(" "));
              cmts.forEach(
                (commitMessage) =>
                  (wordInCommits = [
                    ...wordInCommits,
                    ...cleanTextList(commitMessage.split(" ")),
                  ])
              );
              affectedFiles = fls.data.map((D) => D.filename);
            } else {
              var commitId = child_process
                .execSync("git rev-parse --short HEAD")
                .toString();
              var commitMessage = child_process
                .execSync("git show -s --format=%s " + commitId)
                .toString();
              var fileNames = child_process
                .execSync(
                  "git diff-tree --no-commit-id --name-only -r ${{ github.sha }}"
                )
                .toString();

              wordInCommits = cleanTextList(commitMessage.split(" "));
              affectedFiles = cleanTextList(fileNames.split("\n"));
            }

            wordInCommits = uniq(wordInCommits);
            wordInCommits = wordInCommits.filter((k) => k.length > 3);
            // TODO IMPLEMENT TEST SELECTION LOGIC BASED ON THE FILES(files:faraible) + COMMITS WORDS (commits:variable)
            console.log("commit words", wordInCommits);
            console.log("affected files", affectedFiles);

            // the test folder name
            // retive only fille tracked by the git repo
            var testFiles = cleanTextList(
              (child_process.execSync("git ls-files") + "").split("\n")
            ).filter((k) => k.indexOf(testFolderName.toLowerCase()) == 0);
            testFiles.forEach((fileName) => {
              // todo retive the list a file
              var fn = path.parse(fileName).name.toLowerCase();

              for (let word of wordInCommits) {
                if (fn.indexOf(word.toLowerCase()) >= 0) {
                  distFilesArray.push(fileName);
                  return;
                }
              }
              for (let affFile of affectedFiles) {
                var fp = path.parse(affFile);
                var AffFileName = (fp.name || fp.ext || "").toLowerCase();
                if (
                  AffFileName.length > 0 &&
                  fn.indexOf(AffFileName.toLowerCase()) >= 0
                ) {
                  distFilesArray.push(fileName);
                  return;
                }
              }
            });

            require("fs").writeFileSync(
              "./matrix-values.json",
              JSON.stringify({
                include: distFilesArray.map((k) => ({
                  testFile: k,
                })),
              })
            );
            // core.setOutput("matrix", process.env.jsonconfig);
          }
        }
      }
    }
  }
}
