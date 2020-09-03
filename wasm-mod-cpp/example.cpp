#include <emscripten/bind.h>
#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <string>

using namespace emscripten;

struct Point  {
  int32_t x, y;
};
struct Rect {
  int32_t left, top, right, bottom;
};

extern "C" bool Draw(Point* p, Rect r);;
extern "C" void LogFromJS(std::string str);

std::vector<int> returnVectorData () {
  std::vector<int> v(10, 1);
  LogFromJS("param from c++");
  Point p = {100, 200};
  Rect rect = {250, 200, 350, 300}; 
  std::cout << std::boolalpha << Draw(&p, rect) << std::endl;
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

bool ArrayMul(uint32_t* arr, int length, int num)
{
  for(int i = 0; i < length; i++) {
    arr[i] *= num;
  }
  return true;
}

bool ArrayMulJs(uint32_t arrJsNumber, int length, int num)
{
  uint32_t* arr = (uint32_t*) arrJsNumber;
  return ArrayMul(arr, length, num);
}

EMSCRIPTEN_BINDINGS(module) {
  function("returnVectorData", &returnVectorData);
  function("returnMapData", &returnMapData);
  function("exclaim", &exclaim);
  function("ArrayMulJs", &ArrayMulJs, allow_raw_pointers());
  function("ArrayMul", optional_override([](uint32_t arrJsNumber, int length, int num) {
    return ArrayMul((uint32_t*)arrJsNumber, length, num); 
  }));

  // register bindings for std::vector<int> and std::map<int, std::string>.
  register_vector<int>("vector<int>");
  register_map<int, std::string>("map<int, string>");
}