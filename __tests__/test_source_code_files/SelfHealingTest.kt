package com.comatch.search

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInfo
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.platform.suite.api.SelectPackages
import org.junit.platform.suite.api.Suite
import org.junit.platform.suite.api.SuiteDisplayName

@Suite
@SuiteDisplayName("JUnit Platform Suite Demo")
@SelectPackages("example")
class MyFunctionTest {

    @Test
    @DisplayName(
        "targetFunction: myFunction, functionSourcePath: src/test/kotlin/com/comatch/search/SelfHealingTest.kt"
    )
    fun testMyFunction(testInfo: TestInfo) {
        val expectedOutput = 42
        assertDoesNotThrow(testInfo.displayName) { assertEquals(expectedOutput, myFunction(), testInfo.displayName) }
    }

    // The target function to be tested
    private fun myFunction(): Int {
        return 42
    }

//Adding the @Throws annotation
@Throws(NotImplementedError::class)
fun myFunction(): Int {
        return 42
    }
}
