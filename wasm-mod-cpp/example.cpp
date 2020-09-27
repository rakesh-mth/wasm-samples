#include <emscripten/bind.h>
#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <string>
#include <array>

using namespace emscripten;

class MyClass {
public:
    MyClass(int x, std::string y) : x(x), y(y){}

    void incrementX() { ++x; }

    int getX() const { return x; }
    void setX(int x_) { x = x_; }
    std::string getY() const { return y; }
    void setY(std::string y_) { y = y_; }

    static std::string getStringFromInstance(const MyClass& instance) { return instance.y; }
    static void setStringToInstance(MyClass& instance) { instance.y = "World"; }

private:
    int x;
    std::string y;
};

struct Point  {
  int32_t x, y;
};
struct Rect {
  int32_t left, top, right, bottom;
};
struct Regions
{
    bool enabled;
    uint8_t flags;
    Rect rects[2];
};

extern "C" bool Draw(Point* p, Rect r);;
extern "C" void LogFromJS(std::string str);

MyClass* GetMyCalss() {
    auto pMyClass = new MyClass(1, "hi");
    printf("MyClass: obj %p\n", pMyClass);
    return pMyClass;
}
void DeleteMyClass(MyClass* pMyClass) {
    printf("MyClass: obj %p\n", pMyClass);
    delete pMyClass;
}
void PrintMyClass(MyClass* pMyClass) {
    printf("MyClass:: %p: %d, %s\n", pMyClass, pMyClass->getX(), pMyClass->getY().c_str());
}
void MyClassSetX(MyClass& myClass, int x) {
    myClass.setX(x);
    printf("MyClass:: %p: %d, %s\n", &myClass, myClass.getX(), myClass.getY().c_str());
}
void MyClassDecrementX(MyClass& myClass) { myClass.setX(myClass.getX() - 1); }

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

Regions TransformRegions(Regions r)
{
  r.enabled = false;
  r.rects[0].left = 100;
  r.rects[0].right = 200;
  return r;
}

EMSCRIPTEN_BINDINGS(module) {
  value_object<Rect>("Rect")
      .field("left", &Rect::left)
      .field("top", &Rect::top)
      .field("right", &Rect::right)
      .field("bottom", &Rect::bottom);
  function("returnVectorData", &returnVectorData);
  function("returnMapData", &returnMapData);
  function("exclaim", &exclaim);
  function("ArrayMulJs", &ArrayMulJs, allow_raw_pointers());
  function("ArrayMul", optional_override([](uint32_t arrJsNumber, int length, int num) {
    return ArrayMul((uint32_t*)arrJsNumber, length, num); 
  }));
  function("TransformRegions", &TransformRegions);

  // register bindings for std::vector<int> and std::map<int, std::string>.
  register_vector<int>("vector<int>");
  register_map<int, std::string>("map<int, string>");
}

EMSCRIPTEN_BINDINGS(regions_export) {
  value_object<Regions>("Regions")
      .field("enabled", &Regions::enabled)
      .field("flags", &Regions::flags)
      .field("rects", &Regions::rects);
  value_array<std::array<Rect, 2>>("array_NestedRect_2")
        .element(emscripten::index<0>())
        .element(emscripten::index<1>());
}

EMSCRIPTEN_BINDINGS(my_class_example) {
  class_<MyClass>("MyClass")
    .constructor<int, std::string>()
    .function("incrementX", &MyClass::incrementX)
    .function("decrementX", &MyClassDecrementX)
    .property("x", &MyClass::getX, &MyClass::setX)
    .property("y", &MyClass::getY, &MyClass::setY)
    .class_function("getStringFromInstance", &MyClass::getStringFromInstance)
    .class_function("setStringToInstance", &MyClass::setStringToInstance)
    ;

  function("GetMyClass", &GetMyCalss, allow_raw_pointers());
  function("DeleteMyClass", &DeleteMyClass, allow_raw_pointers());
  function("PrintMyClass", &PrintMyClass, allow_raw_pointers());
  function("MyClassSetX", &MyClassSetX, allow_raw_pointers());
}