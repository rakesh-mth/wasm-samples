#include <emscripten/bind.h>
#include <string>
#include <vector>
#include <map>
#include <string>

using namespace emscripten;

extern "C" void logFromJS(std::string str);

class TW_INSTANCE {
    public:
        int instanceId = 0;
};

std::vector<int> returnVectorData () {
  std::vector<int> v(10, 1);
  logFromJS("param from c++");
  return v;
}

std::map<int, std::string> returnMapData () {
  std::map<int, std::string> m;
  m.insert(std::pair<int, std::string>(10, "This is a string."));
  return m;
}

std::string exclaim(std::string message) 
{
  return message + "!";
}

EMSCRIPTEN_BINDINGS(module) {
  function("returnVectorData", &returnVectorData);
  function("returnMapData", &returnMapData);
  function("exclaim", &exclaim);

  // register bindings for std::vector<int> and std::map<int, std::string>.
  register_vector<int>("vector<int>");
  register_map<int, std::string>("map<int, string>");
}